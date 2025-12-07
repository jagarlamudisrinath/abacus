#!/bin/sh
set -e

# Initialize users from INIT_USERS environment variable
# Format: comma-separated identifier:name pairs
# Example: INIT_USERS=user@example.com:User Name,STU001:Student Name

if [ -z "$INIT_USERS" ]; then
    echo "No INIT_USERS defined, skipping user initialization"
    exit 0
fi

echo "Initializing users from INIT_USERS environment variable..."

# Save original IFS and set to comma for splitting
OLD_IFS="$IFS"
IFS=','

for user in $INIT_USERS; do
    # Reset IFS for internal processing
    IFS="$OLD_IFS"

    # Split by colon to get identifier and name
    identifier=$(echo "$user" | cut -d':' -f1 | xargs)
    name=$(echo "$user" | cut -d':' -f2- | xargs)

    if [ -z "$identifier" ] || [ -z "$name" ]; then
        echo "Skipping invalid entry: $user"
        IFS=','
        continue
    fi

    # Check if identifier contains @ (email)
    case "$identifier" in
        *@*)
            # Email-based user
            echo "Creating user with email: $identifier ($name)"
            psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<EOSQL
INSERT INTO students (email, name)
VALUES ('$identifier', '$name')
ON CONFLICT (email) DO NOTHING;
EOSQL
            ;;
        *)
            # Student ID-based user
            echo "Creating user with student_id: $identifier ($name)"
            psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<EOSQL
INSERT INTO students (student_id, name)
VALUES ('$identifier', '$name')
ON CONFLICT (student_id) DO NOTHING;
EOSQL
            ;;
    esac

    IFS=','
done

IFS="$OLD_IFS"
echo "User initialization complete!"
