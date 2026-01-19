#!/bin/bash

# PgAdmin Setup Script
# Adds PostgreSQL server connection to PgAdmin automatically

set -e

PGADMIN_CONFIG_DIR="/var/lib/pgadmin"
SERVERS_JSON="$PGADMIN_CONFIG_DIR/storage/servers.json"

echo "Setting up PgAdmin PostgreSQL connections..."

# Wait for PgAdmin to initialize
sleep 10

# Create servers.json if it doesn't exist
mkdir -p "$(dirname "$SERVERS_JSON")"

if [ ! -f "$SERVERS_JSON" ]; then
    cat > "$SERVERS_JSON" << 'EOF'
{
    "Servers": {
        "1": {
            "Name": "ComicWise PostgreSQL",
            "Group": "Servers",
            "Host": "postgres",
            "Port": 5432,
            "MaintenanceDB": "postgres",
            "Username": "dev",
            "Password": "dev123",
            "SSLMode": "prefer",
            "Shared": false,
            "IdentityFile": null,
            "Tunnel": 0,
            "TunnelUnique": null,
            "UseSSHTunneling": 0,
            "TunnelHost": null,
            "TunnelPort": 22,
            "TunnelUsername": null,
            "TunnelAuthentication": 0,
            "KerberosAuthentication": false,
            "Cert": null,
            "KeyFile": null,
            "CertFile": null,
            "ClientCertFile": null,
            "ClientKeyFile": null,
            "SSLCompression": false,
            "Oid": null,
            "Rolename": null,
            "AdvancedServerProperties": {},
            "DBRestrictionList": [],
            "ConnectionParameters": []
        }
    }
}
EOF
    echo "✓ Created servers.json with PostgreSQL connection"
    chown pgadmin:pgadmin "$SERVERS_JSON"
    chmod 600 "$SERVERS_JSON"
else
    echo "✓ servers.json already exists"
fi

echo "✓ PgAdmin setup complete"
echo "  Access PgAdmin at http://localhost:5050"
echo "  Email: ${PGADMIN_DEFAULT_EMAIL:-admin@example.com}"
echo "  Password: ${PGADMIN_DEFAULT_PASSWORD:-admin}"
