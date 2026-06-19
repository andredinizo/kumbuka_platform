from databricks.sdk import WorkspaceClient
from databricks.sdk.service.sql import StatementState, ExecuteStatementRequestOnWaitTimeout
import time

# ──────────────────────────────────────────
# Configuration
# ──────────────────────────────────────────
WORKSPACE_URL = "https://<WORKSPACE_ID>.azuredatabricks.net"
TOKEN = "<TOKEN_VALUE>"
WAREHOUSE_ID = "<WAREHOUSE_ID>"
CATALOG = "<CATALOG_NAME>"
SCHEMA = "<SCHEMA_NAME>"
TABLE = "<TABLE_NAME>"

# ──────────────────────────────────────────
# Client
# ──────────────────────────────────────────
client = WorkspaceClient(
    host=WORKSPACE_URL,
    token=TOKEN
)
 
# ──────────────────────────────────────────
# Execute query
# ──────────────────────────────────────────
response = client.statement_execution.execute_statement(
    statement=f"SELECT * FROM {CATALOG}.{SCHEMA}.{TABLE} LIMIT 100",
    warehouse_id=WAREHOUSE_ID,
    wait_timeout="30s",
    on_wait_timeout=ExecuteStatementRequestOnWaitTimeout.CONTINUE # ← enum, not string
)
 
# ──────────────────────────────────────────
# Poll until done
# ──────────────────────────────────────────
statement_id = response.statement_id
 
while response.status.state in (StatementState.PENDING, StatementState.RUNNING):
    print(f"⏳ Query state: {response.status.state} — polling...")
    time.sleep(2)
    response = client.statement_execution.get_statement(statement_id)
 
# ──────────────────────────────────────────
# Handle result
# ──────────────────────────────────────────
if response.status.state == StatementState.SUCCEEDED:
    schema = response.manifest.schema.columns
    columns = [col.name for col in schema]
    rows = response.result.data_array or []
    
    print(f"✅ {len(rows)} rows returned\n")
    print(" | ".join(columns))
    print("-" * (len(columns) * 20))
    
    for row in rows:
        print(" | ".join(str(v) for v in row))
 
else:
    error = response.status.error
    print(f"❌ Query failed [{response.status.state}]: {error.message}")
