"use strict";(()=>{var e={};e.id=3707,e.ids=[3707],e.modules={30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},13685:e=>{e.exports=require("http")},95687:e=>{e.exports=require("https")},85477:e=>{e.exports=require("punycode")},12781:e=>{e.exports=require("stream")},57310:e=>{e.exports=require("url")},59796:e=>{e.exports=require("zlib")},80423:(e,r,t)=>{t.r(r),t.d(r,{headerHooks:()=>b,originalPathname:()=>Z,requestAsyncStorage:()=>y,routeModule:()=>v,serverHooks:()=>w,staticGenerationAsyncStorage:()=>q,staticGenerationBailout:()=>j});var a={};t.r(a),t.d(a,{GET:()=>m,POST:()=>_,dynamic:()=>u,revalidate:()=>d}),t(95655);var s=t(83323),i=t(54647),o=t(66886),n=t(93439);let u="force-dynamic",d=0;async function m(e){try{let{searchParams:r}=new URL(e.url),t=r.get("userId");if(!t)return o.Z.json({error:"User email is required"},{status:400});console.log("Fetching dashboard data for user email:",t);let{data:a,error:s}=await n.p.from("users").select("*").eq("email",t).single();if(s||!a)return o.Z.json({error:"User not found"},{status:404});if("male"===a.gender)return await c(a.id,a);if("female"===a.gender)return await l(a.id,a);return o.Z.json({error:"Invalid user gender"},{status:400})}catch(e){return console.error("Dashboard API error:",e),o.Z.json({error:"Internal server error"},{status:500})}}async function c(e,r){try{let{data:t}=await n.p.from("profile_assignments").select(`
        *,
        female_user:users!profile_assignments_female_user_id_fkey (
          id,
          full_name,
          age,
          university,
          profile_photo,
          bio,
          instagram
        )
      `).eq("male_user_id",e).eq("status","assigned"),{data:a}=await n.p.from("temporary_matches").select(`
        *,
        female_user:users!temporary_matches_female_user_id_fkey (
          id,
          full_name,
          age,
          university,
          profile_photo,
          bio,
          instagram
        )
      `).eq("male_user_id",e).eq("status","active").single(),{data:s}=await n.p.from("permanent_matches").select(`
        *,
        female_user:users!permanent_matches_female_user_id_fkey (
          id,
          full_name,
          age,
          university,
          profile_photo,
          bio,
          instagram
        )
      `).eq("male_user_id",e).eq("status","active").single(),i={user:r,assignedProfiles:t||[],currentTempMatch:a,permanentMatch:s,canReveal:(t?.length||0)>0&&!a&&!s,hasActiveDecision:r.decision_timer_active&&a,decisionExpiresAt:r.decision_timer_expires_at,canRequestRound2:"premium"===r.subscription_type&&1===r.current_round&&a&&r.decision_timer_active,isLocked:!!s,maxAssignments:"premium"===r.subscription_type?3:1};return o.Z.json({success:!0,type:"male",dashboard:i})}catch(e){return console.error("Male dashboard error:",e),o.Z.json({error:"Failed to fetch male dashboard"},{status:500})}}async function l(e,r){try{let{data:t}=await n.p.from("temporary_matches").select(`
        *,
        male_user:users!temporary_matches_male_user_id_fkey (
          id,
          full_name,
          age,
          university,
          profile_photo,
          bio,
          instagram
        )
      `).eq("female_user_id",e).eq("status","active"),{data:a}=await n.p.from("permanent_matches").select(`
        *,
        male_user:users!permanent_matches_male_user_id_fkey (
          id,
          full_name,
          age,
          university,
          profile_photo,
          bio,
          instagram
        )
      `).eq("female_user_id",e).eq("status","active"),s={user:r,maleProfiles:t?.map(e=>({...e.male_user,tempMatchId:e.id,selectedAt:e.created_at,expiresAt:e.expires_at}))||[],permanentMatches:a?.map(e=>({...e.male_user,permMatchId:e.id,matchedAt:e.created_at}))||[]};return o.Z.json({success:!0,type:"female",dashboard:s})}catch(e){return console.error("Female dashboard error:",e),o.Z.json({error:"Failed to fetch female dashboard"},{status:500})}}async function _(e){try{let r=await e.json(),{action:t,userId:a,data:s}=r;console.log("Dashboard API POST action:",t);let{data:i,error:u}=await n.p.from("users").select("id").eq("email",a).single();if(u||!i)return o.Z.json({error:"User not found"},{status:404});switch(t){case"reveal_profile":return await p(i.id,s.assignmentId);case"request_round_2":return await f(i.id);case"confirm_match":return await h(i.id);default:return o.Z.json({error:"Invalid action"},{status:400})}}catch(e){return console.error("Dashboard API POST error:",e),o.Z.json({error:"Internal server error"},{status:500})}}async function p(e,r){try{let{data:t,error:a}=await n.p.from("profile_assignments").select("*").eq("id",r).eq("male_user_id",e).eq("status","assigned").single();if(a||!t)return o.Z.json({error:"Assignment not found"},{status:404});let{data:s}=await n.p.from("temporary_matches").select("*").eq("male_user_id",e).eq("status","active").single();if(s)return o.Z.json({error:"You already have an active selection"},{status:400});await n.p.from("profile_assignments").update({status:"revealed",revealed_at:new Date().toISOString()}).eq("id",r),await n.p.from("profile_assignments").update({status:"hidden"}).eq("male_user_id",e).eq("status","assigned").neq("id",r);let i=new Date;i.setHours(i.getHours()+48);let{data:u,error:d}=await n.p.from("temporary_matches").insert({male_user_id:e,female_user_id:t.female_user_id,assignment_id:r,status:"active",expires_at:i.toISOString()}).select().single();if(d)return o.Z.json({error:"Failed to create temporary match"},{status:500});return await n.p.from("users").update({decision_timer_active:!0,decision_timer_expires_at:i.toISOString(),temp_match_id:u.id}).eq("id",e),o.Z.json({success:!0,tempMatch:u,message:"Profile revealed! You have 48 hours to decide."})}catch(e){return console.error("Reveal profile error:",e),o.Z.json({error:"Internal server error"},{status:500})}}async function f(e){try{let{error:r}=await n.p.from("users").update({round_2_requested:!0,round_2_requested_at:new Date().toISOString(),current_round:2,decision_timer_active:!1,decision_timer_expires_at:null}).eq("id",e);if(r)return o.Z.json({error:"Failed to update user"},{status:500});return await n.p.from("temporary_matches").update({status:"disengaged"}).eq("male_user_id",e).eq("status","active"),o.Z.json({success:!0,message:"Round 2 requested! You can now be assigned new profiles."})}catch(e){return console.error("Request round 2 error:",e),o.Z.json({error:"Internal server error"},{status:500})}}async function h(e){try{let{data:r,error:t}=await n.p.from("temporary_matches").select("*").eq("male_user_id",e).eq("status","active").single();if(t||!r)return o.Z.json({error:"No active temporary match found"},{status:404});let{data:a,error:s}=await n.p.from("permanent_matches").insert({temporary_match_id:r.id,male_user_id:e,female_user_id:r.female_user_id,status:"active"}).select().single();if(s)return o.Z.json({error:"Failed to create permanent match"},{status:500});return await n.p.from("users").update({permanent_match_id:a.id,match_confirmed_at:new Date().toISOString(),decision_timer_active:!1,decision_timer_expires_at:null}).eq("id",e),await n.p.from("temporary_matches").update({status:"promoted"}).eq("id",r.id),o.Z.json({success:!0,permMatch:a,message:"Match confirmed! You can now connect with each other."})}catch(e){return console.error("Confirm match error:",e),o.Z.json({error:"Internal server error"},{status:500})}}let g=s.AppRouteRouteModule,v=new g({definition:{kind:i.x.APP_ROUTE,page:"/api/dashboard/route",pathname:"/api/dashboard",filename:"route",bundlePath:"app/api/dashboard/route"},resolvedPagePath:"/home/aman/Desktop/cufy_3.1v-1/app/api/dashboard/route.ts",nextConfigOutput:"",userland:a}),{requestAsyncStorage:y,staticGenerationAsyncStorage:q,serverHooks:w,headerHooks:b,staticGenerationBailout:j}=v,Z="/api/dashboard/route"}};var r=require("../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),a=r.X(0,[9195,6886,3433,7221],()=>t(80423));module.exports=a})();