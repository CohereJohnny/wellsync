import base64
from contextlib import asynccontextmanager

import uvicorn
from mcp.server.fastmcp import Context, FastMCP
from mcp.server.sse import SseServerTransport
from pydantic import BaseModel, Field
from starlette.applications import Starlette
from starlette.exceptions import HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
from starlette.routing import Mount, Route
from starlette.types import Receive, Scope, Send


class AuthHeaderTokens(BaseModel):
    # The decoded authorization header
    auth_token: str | None
    connector_access_tokens: dict[str, str] = Field(default_factory=dict)
    server_secret: str | None


def auth_header_tokens_from_raw_header(header: str) -> AuthHeaderTokens:
    return AuthHeaderTokens.model_validate_json(base64.b64decode(header).decode())


def extract_tokens_from_ctx(ctx: Context) -> AuthHeaderTokens:
    # TODO: This is only accessible if using the forked version of the sdk where
    # the `headers` attribute exists in the request context
    header = ctx.request_context.headers.get("authorization")  # type: ignore
    if not header:
        raise ValueError("Authorization header missing")
    return auth_header_tokens_from_raw_header(header)


class AuthorizedMCP(FastMCP):
    """
    This is an extended version of the FastMCP class that includes an authorization secret.
    If the secret is provided, the server will require an Authorization header with the secret value as a Bearer token.
    """

    def __init__(self, *args, auth_secret: str | None = None, **kwargs):
        super().__init__(*args, **kwargs)
        self.auth_secret = auth_secret
        self.starlette_app = self._create_starlette_app()
        self.starlette_app.add_middleware(AuthorizationMiddleware, secret=auth_secret)

    def _create_starlette_app(self) -> Starlette:
        sse = SseServerTransport("/messages/")

        async def handle_sse(request):
            async with sse.connect_sse(
                request.scope, request.receive, request._send
            ) as streams:
                await self._mcp_server.run(
                    streams[0],
                    streams[1],
                    self._mcp_server.create_initialization_options(),
                )

        return Starlette(
            debug=self.settings.debug,
            routes=[
                Route("/sse", endpoint=handle_sse),
                Mount("/messages/", app=sse.handle_post_message),
            ],
        )

    async def run_sse_async(self) -> None:
        """Run the server using SSE transport."""
        config = uvicorn.Config(
            self.starlette_app,
            host=self.settings.host,
            port=self.settings.port,
            log_level=self.settings.log_level.lower(),
        )
        server = uvicorn.Server(config)
        await server.serve()


class AuthorizationMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, secret):
        super().__init__(app)
        self.secret = secret

    async def dispatch(self, request: Request, call_next):
        # Check for the Authorization header
        auth_header = request.headers.get("authorization", None)
        if not auth_header:
            res = JSONResponse(
                {"error": "Authorization header missing"}, status_code=401
            )
            return res
        tokens = auth_header_tokens_from_raw_header(auth_header)
        if tokens.server_secret != self.secret:
            res = JSONResponse(
                {"error": "Invalid authorization token"}, status_code=401
            )
            return res

        # If the header is present, proceed with the request
        response = await call_next(request)
        return response


# Use this for low-level server implementation.
class BearerSecretTransport(SseServerTransport):
    def __init__(self, endpoint: str, secret: str):
        super().__init__(endpoint)
        self.secret = secret

    @asynccontextmanager
    async def connect_sse(self, scope: Scope, receive: Receive, send: Send):
        auth_header = dict(scope["headers"]).get(b"authorization", b"").decode("utf-8")
        print(auth_header)
        tokens = auth_header_tokens_from_raw_header(auth_header)
        print(tokens)
        if tokens.server_secret != self.secret:
            raise HTTPException(status_code=401, detail="Unauthorized")
        async with super().connect_sse(scope, receive, send) as streams:
            yield streams
