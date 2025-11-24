# Resend Email Setup Guide for Campaign Planner

## 1. Get Resend API Key
1. Go to [Resend Dashboard](https://resend.com/api-keys)
2. Create a new API Key named "Campaign Planner"
3. Copy the key (starts with `re_`)

## 2. Add to Supabase Secrets
1. Go to your Supabase Project: **Campaign Planner**
2. Go to **Project Settings** -> **Edge Functions** -> **Secrets**
3. Add a new secret:
   - Name: `RESEND_API_KEY`
   - Value: (Paste your key from step 1)

## 3. Deploy Edge Function
Run this command in your terminal:
```bash
npx supabase functions deploy send-email --project-ref yxlbsqzwdcxuqfphucoe
```

## 4. Verify
Once deployed, the app will be able to send emails via the `send-email` function!
