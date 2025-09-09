"use strict";(()=>{var e={};e.id=8137,e.ids=[8137],e.modules={30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},13685:e=>{e.exports=require("http")},95687:e=>{e.exports=require("https")},85477:e=>{e.exports=require("punycode")},12781:e=>{e.exports=require("stream")},57310:e=>{e.exports=require("url")},59796:e=>{e.exports=require("zlib")},98628:(e,t,a)=>{a.r(t),a.d(t,{headerHooks:()=>I,originalPathname:()=>y,requestAsyncStorage:()=>p,routeModule:()=>l,serverHooks:()=>R,staticGenerationAsyncStorage:()=>L,staticGenerationBailout:()=>N});var r={};a.r(r),a.d(r,{GET:()=>m,POST:()=>u}),a(95655);var s=a(83323),n=a(54647),i=a(66886),o=a(93439);async function u(e){try{let{step:t}=await e.json();switch(t){case"check-columns":return await c();case"add-payment-columns":return await T();case"add-instagram-column":return await A();case"create-payments-table":return await E();default:return i.Z.json({error:"Invalid migration step"},{status:400})}}catch(e){return console.error("Migration error:",e),i.Z.json({error:"Migration failed",details:e instanceof Error?e.message:"Unknown error"},{status:500})}}async function c(){try{let{data:e,error:t}=await o.p.from("users").select("*").limit(1);if(t)return i.Z.json({error:"Failed to check table structure",details:t.message},{status:500});let a=e&&e.length>0?Object.keys(e[0]):[];return i.Z.json({success:!0,existingColumns:a,hasSubscriptionType:a.includes("subscription_type"),hasPaymentConfirmed:a.includes("payment_confirmed"),hasInstagram:a.includes("instagram"),sampleData:e?.[0]||null})}catch(e){return i.Z.json({error:"Failed to check columns",details:e instanceof Error?e.message:"Unknown error"},{status:500})}}async function T(){try{let{error:e}=await o.p.rpc("exec_sql",{sql:`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS subscription_type VARCHAR(20) DEFAULT NULL,
        ADD COLUMN IF NOT EXISTS subscription_expiry TIMESTAMP DEFAULT NULL,
        ADD COLUMN IF NOT EXISTS payment_confirmed BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS payment_date TIMESTAMP DEFAULT NULL;
      `});if(e)return console.log("RPC failed, trying alternative approach..."),i.Z.json({success:!1,error:"Need manual SQL execution",sqlToRun:`
          ALTER TABLE users 
          ADD COLUMN IF NOT EXISTS subscription_type VARCHAR(20) DEFAULT NULL,
          ADD COLUMN IF NOT EXISTS subscription_expiry TIMESTAMP DEFAULT NULL,
          ADD COLUMN IF NOT EXISTS payment_confirmed BOOLEAN DEFAULT FALSE,
          ADD COLUMN IF NOT EXISTS payment_date TIMESTAMP DEFAULT NULL;
        `});return i.Z.json({success:!0,message:"Payment columns added successfully"})}catch(e){return i.Z.json({error:"Failed to add payment columns",details:e instanceof Error?e.message:"Unknown error"},{status:500})}}async function A(){try{let{error:e}=await o.p.rpc("exec_sql",{sql:"ALTER TABLE users ADD COLUMN IF NOT EXISTS instagram VARCHAR(255);"});if(e)return i.Z.json({success:!1,error:"Need manual SQL execution",sqlToRun:"ALTER TABLE users ADD COLUMN IF NOT EXISTS instagram VARCHAR(255);"});return i.Z.json({success:!0,message:"Instagram column added successfully"})}catch(e){return i.Z.json({error:"Failed to add Instagram column",details:e instanceof Error?e.message:"Unknown error"},{status:500})}}async function E(){try{let{error:e}=await o.p.rpc("exec_sql",{sql:`
        CREATE TABLE IF NOT EXISTS payments (
          id SERIAL PRIMARY KEY,
          user_email VARCHAR(255) NOT NULL,
          subscription_type VARCHAR(20) NOT NULL,
          amount DECIMAL(10,2) NOT NULL,
          currency VARCHAR(3) DEFAULT 'INR',
          payment_method VARCHAR(50),
          payment_status VARCHAR(20) DEFAULT 'pending',
          payment_id VARCHAR(255),
          payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          expiry_date TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_email) REFERENCES users(email)
        );
      `});if(e)return i.Z.json({success:!1,error:"Need manual SQL execution",sqlToRun:`
          CREATE TABLE IF NOT EXISTS payments (
            id SERIAL PRIMARY KEY,
            user_email VARCHAR(255) NOT NULL,
            subscription_type VARCHAR(20) NOT NULL,
            amount DECIMAL(10,2) NOT NULL,
            currency VARCHAR(3) DEFAULT 'INR',
            payment_method VARCHAR(50),
            payment_status VARCHAR(20) DEFAULT 'pending',
            payment_id VARCHAR(255),
            payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            expiry_date TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_email) REFERENCES users(email)
          );
        `});return i.Z.json({success:!0,message:"Payments table created successfully"})}catch(e){return i.Z.json({error:"Failed to create payments table",details:e instanceof Error?e.message:"Unknown error"},{status:500})}}async function m(){return i.Z.json({message:"Database Migration API",availableSteps:["check-columns","add-payment-columns","add-instagram-column","create-payments-table"]})}let d=s.AppRouteRouteModule,l=new d({definition:{kind:n.x.APP_ROUTE,page:"/api/admin/migrate-database/route",pathname:"/api/admin/migrate-database",filename:"route",bundlePath:"app/api/admin/migrate-database/route"},resolvedPagePath:"/home/aman/Desktop/cufy_3.1v-1/app/api/admin/migrate-database/route.ts",nextConfigOutput:"",userland:r}),{requestAsyncStorage:p,staticGenerationAsyncStorage:L,serverHooks:R,headerHooks:I,staticGenerationBailout:N}=l,y="/api/admin/migrate-database/route"}};var t=require("../../../../webpack-runtime.js");t.C(e);var a=e=>t(t.s=e),r=t.X(0,[9195,6886,3433,7221],()=>a(98628));module.exports=r})();