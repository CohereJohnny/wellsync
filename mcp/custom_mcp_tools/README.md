# MCP Custom tools in North

## Quickstart

This is a simple guide for adding and using custom tools in North, by registering [MCP](https://modelcontextprotocol.io/introduction) library and register it in North. It assumes North is running on `north.cohere.com`. A user can have a server running with N number of tools, and register it in North. The user can then use the tools in North UI.

#### Install the SDK with pip:

```bash
pip install mcp
```

If you are using connector auth, you need to install the following forked version of the SDK:
```bash
pip install git+https://github.com/abdullahkady/python-sdk.git
```

#### Create a tiny server (tool to add numbers):

Assuming you are creating the server in the mcp-server directory, otherwise copy the auth file to the directory where you are creating the server.

```python
from custom_mcp_tools.auth_utils import AuthorizedMCP

mcp = AuthorizedMCP("calculator", debug=True, port=3001, auth_secret="some-secret")


@mcp.tool()
def add_two_numbers(a: int, b: int) -> int:
    """Add two numbers"""
    return a + b


if __name__ == "__main__":
    mcp.run(transport="sse")
```

#### Run the server:

```bash
python calculator.py
```

#### Register the server in North:

Notice, we pass the API the secret that was used in the server code.

```bash
curl --location "${HOST}/internal/v1/mcp_servers/" \
--header 'Content-Type: application/json' \
--header "Authorization: Bearer ${NORTH_TOKEN}"" \
--data '{
    "url": "http://host.docker.internal:3001",
    "name": "calculator",
    "secret": "some-secret"
}'
```

That's all you need. Now you can use the tool in North UI once you enable custom tools from the profile settings.

## Server Registration and Caching

On registration, the servers (and their list of tools) are cached in North. This is to avoid making requests to the servers every time a user wants to use a tool. The cache is updated only when a new server is added, updated, or deleted.

To register a server in North, you need to send a POST request to the `/internal/v1/mcp_servers/` like so:

```bash
export HOST=https://stg.demo.cloud.cohere.com/api
export NORTH_TOKEN=YOUR_TOKEN
export MCP_SERVER_URL=https://host.docker.internal:3001 # This is the url of the server you are registering
```

```bash
curl --location "${HOST}/internal/v1/mcp_servers" \
--header "Content-Type: application/json" \
--header "Authorization: Bearer ${NORTH_TOKEN}" \
--data '{
    "url": '"\"${MCP_SERVER_URL}\""',
    "name": "calculator",
    "secret": "some-secret"
}'
```

For deletion, you can use the the following:

```bash
curl --location "${HOST}/internal/v1/mcp_servers/delete" \
--header "Content-Type: application/json" \
--header "Authorization: Bearer ${NORTH_TOKEN}" \
--data '{
    "url": '"\"${MCP_SERVER_URL}\""'
}'
```

Note: The servers are not tied to the users creating them. Every user can see the list of servers and use the tools registered by other users (this is for v0, we will look into access control and roles in the future).

## Authentication and 3rd party connector Authorization

Note: This documentation is a work in progress and needs to be updated for a fully featured flow of authorizing 3rd party connectors. For now it's just one example with Google.


The server will receive an authorization token from North that is simply a base64 encoded object with the following structure:

```jsonc
{
    "auth_token": "north_auth_token",
    // This a token for the user. Server can verify the signature for authentication.
    // TODO: Should we not send this and just send the decoded body of the token? Is there a risk?
    "connector_access_tokens": {
        // connector_id at the moment is only going to be google.
        "connector_id": "raw_connector_access_token" // This is the token for the connector that the server can use to make API calls to the connector directly. Check
    },
    "server_secret": "some_secret" // This is the shared secret between the server and North that the server should use to verify the request.
}
```

From `custom_mcp_tools/auth_utils.py` you can use the `auth_header_tokens_from_raw_header`, and the `extract_tokens_from_ctx` functions to extract the tokens from the context object (or the header). Check the example usage in both `calculator.py` and `calculator_low_level.py`. For an example of using a connector (in our case google, to make gmail api calls), check the `google_api_example.py`.

### To authorize a connector (currently just google) in North

```bash
curl --location --request GET "${HOST}/internal/v1/connectors/auth_url/google" \
--header 'Content-Type: application/json' \
--header "Authorization: ${NORTH_TOKEN}"
```

### Specifying google as a required connector in the server

When registering the MCP server, you can specify the required connectors like so:

```bash
curl --location "${HOST}/internal/v1/mcp_servers/" \
--header 'Content-Type: application/json' \
--header "Authorization: Bearer ${NORTH_TOKEN}" \
--data '{
    "url": "http://host.docker.internal:3001",
    "name": "calculator",
    "secret": "some-secret",
    "required_connectors": ["google"]
}'
```

## More on server implementation

The server implementation is simple. You need to create a server instance and register tools using the `@mcp.tool()` decorator. The tools should be async functions that take the arguments and optionally the context object.
By default, MCP will pull out the function docstring (and the argument types) to infer the tool definition (which is the one shown in the prompt in North). Generally speaking, it's likely that the tool you are creating requires more tweaking to the prompt. You can define the tool definition explicitly by implementing a `list_tools` method like so:

````python
@mcp.list_tools()
async def list_tools() -> list[Tool]:
    postgres_description = """
    A simple tool that will query a postgres database with a given sql query.
    The return will always be a list of dictionaries, where each dictionary represents a row in the database.

    Example result for a query that returns 2 rows with 2 columns each (age/name):
    ```json
    [
        {
            "name": "John Doe",
            "age": 30
        },
        {
            "name": "Jane Doe",
            "age": 25
        }
    ]
    """
    return [
        Tool(
            name="postgres_query",
            description=postgres_description + postgres_tables,
            inputSchema={
                "type": "object",
                "properties": {
                    "sql_query": {
                        "type": "string",
                        "description": "The sql query to execute",
                    },
                },
                "required": ["sql_query"],
            },
        ),
    ]
````

## Tips

- Secret token to authenticate the server is optional, but recommended.
- The result from the tool will not be chunked and reranked by North. This means that it's the server's responsibility to return the results in the order they should be displayed.
- The server should be running when you register it in North, otherwise, the registration will fail.
- Since our caching is simple, if you have a server running and you want to update the tools, you need to trigger a cache refresh by re-registering the server (either delete and re-add or update the server by creating it again).
- The server should be running when you want to use the tools in North. If the server is down, the tools will return errors in North.
- In MCP server implementation, the doc string is used as the description of the tool in the prompt. Make sure to add a doc string to your tools.

