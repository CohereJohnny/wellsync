"""
This is an example of a simple calculator tool that uses a low-level server with authentication.
The token is passed in the Authorization header as a Bearer token. And the check is done with a custom transport class.

For simpler implementation, consider using the `AuthorizedMCP` in the `auth_utils` module.
"""

from typing import Any

import uvicorn
from mcp import types
from mcp.server.lowlevel import Server
from starlette.applications import Starlette
from starlette.exceptions import HTTPException
from starlette.routing import Mount, Route

from custom_mcp_tools.auth_utils import BearerSecretTransport

app = Server("mcp-basic-auth-transport")


@app.list_tools()
async def list_tools() -> list[types.Tool]:
    return [
        types.Tool(
            name="add_two_integers",
            description="Add two integers together.",
            inputSchema={
                "type": "object",
                "required": ["a", "b"],
                "properties": {
                    "a": {
                        "type": "integer",
                        "description": "The first integer.",
                    },
                    "b": {
                        "type": "integer",
                        "description": "The second integer.",
                    },
                },
            },
        )
    ]


@app.call_tool()
async def handle_call_tool(
    tool_name: str, tool_params: dict[str, Any]
) -> list[types.TextContent]:
    # Note: in low level server you have to always return a list of text/image/etc content types.
    if tool_name == "add_two_integers":
        return [
            types.TextContent(
                type="text",
                text=add_two_integers_can_be_any_name(**tool_params),
            )
        ]
    raise HTTPException(status_code=404, detail="Tool not found")


def add_two_integers_can_be_any_name(a: int, b: int) -> str:
    return str(a + b)


sse = BearerSecretTransport("/messages/", "some_secret")


async def handle_sse(request):
    async with sse.connect_sse(
        request.scope, request.receive, request._send
    ) as streams:
        await app.run(streams[0], streams[1], app.create_initialization_options())


starlette_app = Starlette(
    debug=True,
    routes=[
        Route("/sse", endpoint=handle_sse),
        Mount("/messages/", app=sse.handle_post_message),
    ],
)
uvicorn.run(starlette_app, host="0.0.0.0", port=3003)
