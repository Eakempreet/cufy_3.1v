"use strict";(()=>{var e={};e.id=971,e.ids=[971],e.modules={30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},13685:e=>{e.exports=require("http")},95687:e=>{e.exports=require("https")},85477:e=>{e.exports=require("punycode")},12781:e=>{e.exports=require("stream")},57310:e=>{e.exports=require("url")},59796:e=>{e.exports=require("zlib")},98301:(e,s,t)=>{t.r(s),t.d(s,{headerHooks:()=>A,originalPathname:()=>_,requestAsyncStorage:()=>d,routeModule:()=>l,serverHooks:()=>E,staticGenerationAsyncStorage:()=>m,staticGenerationBailout:()=>T});var r={};t.r(r),t.d(r,{GET:()=>u,POST:()=>c}),t(95655);var a=t(83323),i=t(54647),o=t(66886),n=t(93439);async function c(e){try{let{action:s}=await e.json();if("migrate"===s){console.log("Starting database migration...");let{data:e,error:s}=await n.p.from("information_schema.columns").select("column_name").eq("table_name","users").eq("table_schema","public"),t=e?.map(e=>e.column_name)||[];console.log("Existing columns in users table:",t);let r=["instagram","subscription_type","subscription_status","subscription_expiry","payment_confirmed","rounds_used","is_onboarded"].filter(e=>!t.includes(e));for(let e of(console.log("Missing columns:",r),r)){let s="";switch(e){case"instagram":s="ALTER TABLE users ADD COLUMN instagram VARCHAR(255)";break;case"subscription_type":s="ALTER TABLE users ADD COLUMN subscription_type VARCHAR(20) CHECK (subscription_type IN ('basic', 'premium'))";break;case"subscription_status":s="ALTER TABLE users ADD COLUMN subscription_status VARCHAR(20) DEFAULT 'pending' CHECK (subscription_status IN ('pending', 'active', 'expired'))";break;case"subscription_expiry":s="ALTER TABLE users ADD COLUMN subscription_expiry TIMESTAMPTZ";break;case"payment_confirmed":s="ALTER TABLE users ADD COLUMN payment_confirmed BOOLEAN DEFAULT FALSE";break;case"rounds_used":s="ALTER TABLE users ADD COLUMN rounds_used INTEGER DEFAULT 0";break;case"is_onboarded":s="ALTER TABLE users ADD COLUMN is_onboarded BOOLEAN DEFAULT FALSE"}if(s)try{let{error:t}=await n.p.rpc("exec_sql",{sql:s});t?console.log(`Column ${e} might already exist or has constraint issues:`,t.message):console.log(`Added column: ${e}`)}catch(s){console.log(`Error adding column ${e}:`,s)}}let{data:a,error:i}=await n.p.from("subscriptions").select("id").limit(1);if(i&&"PGRST116"===i.code){console.log("Creating subscriptions table...");let e=`
          CREATE TABLE subscriptions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(100) NOT NULL,
            type VARCHAR(20) NOT NULL CHECK (type IN ('basic', 'premium')),
            price DECIMAL(10,2) NOT NULL,
            duration_days INTEGER NOT NULL,
            features JSONB,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          )
        `;try{await n.p.rpc("exec_sql",{sql:e}),console.log("Created subscriptions table");let s=`
            INSERT INTO subscriptions (name, type, price, duration_days, features) VALUES
            ('Basic Plan', 'basic', 99.00, 30, '{"profiles_per_round": 1, "max_rounds": 2, "support": "email", "choice": false}'),
            ('Premium Plan', 'premium', 249.00, 30, '{"profiles_per_round": 3, "max_rounds": 2, "support": "priority", "advanced_filters": true, "choice": true}')
          `;await n.p.rpc("exec_sql",{sql:s}),console.log("Inserted default subscription plans")}catch(e){console.log("Error creating subscriptions table:",e)}}let{data:c,error:u}=await n.p.from("payments").select("id").limit(1);if(u&&"PGRST116"===u.code){console.log("Creating payments table...");let e=`
          CREATE TABLE payments (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            subscription_type VARCHAR(20) NOT NULL,
            amount DECIMAL(10,2) NOT NULL,
            payment_method VARCHAR(50) DEFAULT 'qr_code',
            payment_proof_url TEXT,
            status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
            transaction_id VARCHAR(100),
            admin_notes TEXT,
            confirmed_by UUID REFERENCES users(id),
            confirmed_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          )
        `;try{await n.p.rpc("exec_sql",{sql:e}),console.log("Created payments table")}catch(e){console.log("Error creating payments table:",e)}}return o.Z.json({success:!0,message:"Database migration completed",existingColumns:t,missingColumns:r})}if("check"===s){let{data:e}=await n.p.from("users").select("id",{count:"exact"}),{data:s}=await n.p.from("subscriptions").select("id",{count:"exact"}),{data:t}=await n.p.from("payments").select("id",{count:"exact"});return o.Z.json({users:e?.length||0,subscriptions:s?.length||0,payments:t?.length||0})}return o.Z.json({error:"Invalid action"},{status:400})}catch(e){return console.error("Migration error:",e),o.Z.json({error:"Migration failed",details:e instanceof Error?e.message:"Unknown error"},{status:500})}}async function u(){try{let{data:e,error:s}=await n.p.from("users").select("id, email, subscription_type, payment_confirmed").limit(5);if(s)return o.Z.json({error:"Database connection failed",details:s.message},{status:500});return o.Z.json({success:!0,sampleUsers:e,message:"Database connection successful"})}catch(e){return o.Z.json({error:"Database error",details:e instanceof Error?e.message:"Unknown error"},{status:500})}}let p=a.AppRouteRouteModule,l=new p({definition:{kind:i.x.APP_ROUTE,page:"/api/admin/migrate/route",pathname:"/api/admin/migrate",filename:"route",bundlePath:"app/api/admin/migrate/route"},resolvedPagePath:"/home/aman/Desktop/cufy_3.1v-1/app/api/admin/migrate/route.ts",nextConfigOutput:"",userland:r}),{requestAsyncStorage:d,staticGenerationAsyncStorage:m,serverHooks:E,headerHooks:A,staticGenerationBailout:T}=l,_="/api/admin/migrate/route"}};var s=require("../../../../webpack-runtime.js");s.C(e);var t=e=>s(s.s=e),r=s.X(0,[9195,6886,3433,7221],()=>t(98301));module.exports=r})();