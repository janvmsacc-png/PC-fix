# PCfix Booking System

Flask website for PCfix computer services, online booking, customer confirmation, and administration.

## Self-help troubleshooting

The `/self-help` page provides illustrated, guided checks for common power, performance, network, display, audio, and heat problems. It includes safety stop conditions, external video and manufacturer tutorials, and printable diagnostic summaries.

When a customer books after troubleshooting, the report is stored in the booking's existing `machine_details.diagnostic_report` JSON field. The confirmation flow preserves it, and the admin dashboard displays the attempted checks and safety flag for the technician. No database schema change is required.

## Run locally

```bash
pip install -r requirements.txt
python app.py
```

The app uses the existing Supabase and Resend environment variables when configured. Without them, its original development fallbacks remain available.

## Production

```bash
gunicorn --bind 0.0.0.0:3000 app:app
```
