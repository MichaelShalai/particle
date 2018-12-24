# Run

> node main.js

# Deploy a new version

> gcloud app deploy --split-health-checks

# Update existing version

> gcloud app update --split-health-checks

# Flush old events

Change date to "now" in UTC timezone.

> gcloud alpha pubsub subscriptions seek weather_station-json --time=2018-12-03T02:00:00
