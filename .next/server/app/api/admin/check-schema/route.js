"use strict";(()=>{var e={};e.id=6781,e.ids=[6781],e.modules={30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},13685:e=>{e.exports=require("http")},95687:e=>{e.exports=require("https")},85477:e=>{e.exports=require("punycode")},12781:e=>{e.exports=require("stream")},57310:e=>{e.exports=require("url")},59796:e=>{e.exports=require("zlib")},1404:(e,s,t)=>{t.r(s),t.d(s,{headerHooks:()=>E,originalPathname:()=>b,requestAsyncStorage:()=>m,routeModule:()=>d,serverHooks:()=>A,staticGenerationAsyncStorage:()=>l,staticGenerationBailout:()=>T});var r={};t.r(r),t.d(r,{GET:()=>c,POST:()=>u}),t(95655);var i=t(83323),a=t(54647),n=t(66886),o=t(93439);async function c(){try{console.log("Checking database schema...");let{data:e,error:s}=await o.p.from("users").select("id").limit(1);if(s)return console.error("Database connection failed:",s),n.Z.json({success:!1,error:"Database connection failed",details:s.message},{status:500});let t=!0;try{let{data:e,error:s}=await o.p.from("users").select("subscription_type, payment_confirmed").limit(1);s&&(console.log("Subscription columns test failed:",s.message),s.message.includes("column")&&s.message.includes("does not exist")&&(t=!1))}catch(e){console.log("Subscription columns check error:",e),t=!1}let r=!0;try{let{data:e,error:s}=await o.p.from("subscriptions").select("id").limit(1);s&&"PGRST116"===s.code&&(r=!1)}catch(e){r=!1}let i=!0;try{let{data:e,error:s}=await o.p.from("payments").select("id").limit(1);s&&"PGRST116"===s.code&&(i=!1)}catch(e){i=!1}return n.Z.json({success:!0,schema:{databaseConnected:!0,hasSubscriptionColumns:t,hasSubscriptionsTable:r,hasPaymentsTable:i},needsMigration:!t||!r||!i})}catch(e){return console.error("Schema check error:",e),n.Z.json({success:!1,error:"Schema check failed",details:e instanceof Error?e.message:"Unknown error"},{status:500})}}async function u(){try{console.log("Running database migration...");let e=[],s=[];try{let{error:t}=await o.p.from("users").select("subscription_type, payment_confirmed, subscription_status").limit(1);t&&t.message.includes("does not exist")&&(e.push("Missing subscription columns in users table"),s.push("Need to add: subscription_type, payment_confirmed, subscription_status columns"))}catch(s){e.push("Cannot check subscription columns")}try{let{error:t}=await o.p.from("subscriptions").select("id").limit(1);t&&"PGRST116"===t.code&&(e.push("Missing subscriptions table"),s.push("Need to create subscriptions table"))}catch(t){e.push("Subscriptions table missing"),s.push("Need to create subscriptions table")}try{let{error:t}=await o.p.from("payments").select("id").limit(1);t&&"PGRST116"===t.code&&(e.push("Missing payments table"),s.push("Need to create payments table"))}catch(t){e.push("Payments table missing"),s.push("Need to create payments table")}return n.Z.json({success:!0,issues:e,fixes:s,sqlScript:`
-- Run this SQL in your Supabase SQL editor:

-- Add subscription columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_type VARCHAR(20) CHECK (subscription_type IN ('basic', 'premium'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) DEFAULT 'pending' CHECK (subscription_status IN ('pending', 'active', 'expired'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS payment_confirmed BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_expiry TIMESTAMPTZ;

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('basic', 'premium')),
    price DECIMAL(10,2) NOT NULL,
    duration_days INTEGER NOT NULL,
    features JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_type VARCHAR(20) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'qr_code',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default subscription plans
INSERT INTO subscriptions (name, type, price, duration_days, features) VALUES
('Basic Plan', 'basic', 99.00, 30, '{"profiles_per_round": 1, "max_rounds": 2, "support": "email", "choice": false}'),
('Premium Plan', 'premium', 249.00, 30, '{"profiles_per_round": 3, "max_rounds": 2, "support": "priority", "choice": true}')
ON CONFLICT DO NOTHING;
      `})}catch(e){return console.error("Migration error:",e),n.Z.json({success:!1,error:"Migration failed",details:e instanceof Error?e.message:"Unknown error"},{status:500})}}let p=i.AppRouteRouteModule,d=new p({definition:{kind:a.x.APP_ROUTE,page:"/api/admin/check-schema/route",pathname:"/api/admin/check-schema",filename:"route",bundlePath:"app/api/admin/check-schema/route"},resolvedPagePath:"/home/aman/Desktop/cufy_3.1v/app/api/admin/check-schema/route.ts",nextConfigOutput:"",userland:r}),{requestAsyncStorage:m,staticGenerationAsyncStorage:l,serverHooks:A,headerHooks:E,staticGenerationBailout:T}=d,b="/api/admin/check-schema/route"},54647:(e,s)=>{var t;Object.defineProperty(s,"x",{enumerable:!0,get:function(){return t}}),function(e){e.PAGES="PAGES",e.PAGES_API="PAGES_API",e.APP_PAGE="APP_PAGE",e.APP_ROUTE="APP_ROUTE"}(t||(t={}))}};var s=require("../../../../webpack-runtime.js");s.C(e);var t=e=>s(s.s=e),r=s.X(0,[8336,6886,3433,7221],()=>t(1404));module.exports=r})();