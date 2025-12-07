#!/bin/bash
set -e

# Initialize users from INIT_USERS environment variable
# Format: comma-separated identifier:name pairs
# Example: INIT_USERS=user@example.com:User Name,STU001:Student Name

if [ -z "$INIT_USERS" ]; then
    echo "No INIT_USERS defined, skipping user initialization"
    exit 0
fi

echo "Initializing users from INIT_USERS environment variable..."

IFS=',' read -ra USERS <<< "$INIT_USERS"
for user in "${USERS[@]}"; do
    # Split by colon to get identifier and name
    IFS=':' read -r identifier name <<< "$user"

    # Trim whitespace
    identifier=$(echo "$identifier" | xargs)
    name=$(echo "$name" | xargs)

    if [ -z "$identifier" ] || [ -z "$name" ]; then
        echo "Skipping invalid entry: $user"
        continue
    fi

    if [[ "$identifier" == *"@"* ]]; then
        # Email-based user
        echo "Creating user with email: $identifier ($name)"
        psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
            INSERT INTO students (email, name)
            VALUES ('$identifier', '$name')
            ON CONFLICT (email) DO NOTHING;
EOSQL
    else
        # Student ID-based user
        echo "Creating user with student_id: $identifier ($name)"
        psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
            INSERT INTO students (student_id, name)
            VALUES ('$identifier', '$name')
            ON CONFLICT (student_id) DO NOTHING;
EOSQL
    fi
done

echo "User initialization complete!"
