"""
This server is an example of how to use the passed connector tokens to authenticate with an external service.
The server uses the `google` connector token to authenticate with the Gmail API and list the subjects of the first 10 messages in the inbox.

Note this server also still requires a secret just to authenticate the server to server communication.
"""

import httpx
from mcp.server.fastmcp import Context

from custom_mcp_tools.auth_utils import extract_tokens_from_ctx
from custom_mcp_tools.fast_mcp_auth import AuthorizedMCP

mcp = AuthorizedMCP(
    "with_connector_auth", port=3001, debug=True, auth_secret="custom_secret"
)


@mcp.tool()
async def gmail_list_messages(ctx: Context):
    """
    Example tool that lists all messages in a Gmail account. Uses the `google` connector token
    from the authorization header to authenticate with the Gmail API.
    """
    auth_tokens = extract_tokens_from_ctx(ctx)
    google_access_token = auth_tokens.connector_access_tokens.get("google")
    if not google_access_token:
        raise ValueError("Google access token missing")

    subjects = await _list_gmail_message_subjects(google_access_token)
    return {"message_subjects": subjects}


# This is copilot generated code, not important for the example it just does actual google api calls.
async def _list_gmail_message_subjects(google_access_token):
    url = "https://gmail.googleapis.com/gmail/v1/users/me/messages"
    auth_headers = {
        "accept": "application/json",
        "Authorization": f"Bearer {google_access_token}",
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=auth_headers)
        response.raise_for_status()
        messages = response.json().get("messages", [])

        subjects = []
        for message in messages[:10]:
            message_id = message["id"]
            message_url = (
                f"https://gmail.googleapis.com/gmail/v1/users/me/messages/{message_id}"
            )
            message_response = await client.get(message_url, headers=auth_headers)
            try:
                message_response.raise_for_status()
            except Exception:
                print(f"Failed to fetch message {message_id}")
                continue
            message_data = message_response.json()
            headers = message_data.get("payload", {}).get("headers", [])
            subject = next(
                (header["value"] for header in headers if header["name"] == "Subject"),
                None,
            )
            if subject:
                subjects.append(subject)

    return subjects


if __name__ == "__main__":
    # Initialize and run the server
    mcp.run(transport="sse")
