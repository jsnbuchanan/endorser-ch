

echo "Run tests without full peer JWT validation."

export NODE_ENV=test-local

rm -f ../endorser-ch-$NODE_ENV.sqlite3

DBUSER=sa DBPASS=sasa npm run flyway migrate

# funny... this works without setting the DBUSER & DBPASS
DBUSER=sa DBPASS=sasa PORT=3330 npm run test$1

echo "Also be sure to check that the API docs still work: http://localhost:3000/api-explorer/"
