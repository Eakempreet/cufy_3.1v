"use strict";(()=>{var e={};e.id=3958,e.ids=[3958],e.modules={72934:e=>{e.exports=require("next/dist/client/components/action-async-storage.external.js")},54580:e=>{e.exports=require("next/dist/client/components/request-async-storage.external.js")},45869:e=>{e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},39491:e=>{e.exports=require("assert")},14300:e=>{e.exports=require("buffer")},6113:e=>{e.exports=require("crypto")},82361:e=>{e.exports=require("events")},13685:e=>{e.exports=require("http")},95687:e=>{e.exports=require("https")},85477:e=>{e.exports=require("punycode")},63477:e=>{e.exports=require("querystring")},12781:e=>{e.exports=require("stream")},57310:e=>{e.exports=require("url")},73837:e=>{e.exports=require("util")},59796:e=>{e.exports=require("zlib")},76955:(e,r,t)=>{t.r(r),t.d(r,{headerHooks:()=>g,originalPathname:()=>q,requestAsyncStorage:()=>y,routeModule:()=>_,serverHooks:()=>f,staticGenerationAsyncStorage:()=>x,staticGenerationBailout:()=>h});var a={};t.r(a),t.d(a,{GET:()=>m,dynamic:()=>p,revalidate:()=>d}),t(95655);var s=t(83323),o=t(54647),i=t(66886),n=t(93810),u=t(69542),l=t(93439);let p="force-dynamic",d=0;async function m(e){try{let e=await (0,n.getServerSession)(u.L);if(!e?.user?.email)return i.Z.json({error:"Unauthorized"},{status:401});let{data:r}=await l.p.from("users").select("id").eq("email",e.user.email).single();if(!r)return i.Z.json({error:"User not found"},{status:404});let{data:t,error:a}=await l.p.from("temporary_matches").select(`
        id,
        created_at,
        expires_at,
        male_user:male_user_id (
          id,
          full_name,
          age,
          university,
          profile_photo,
          bio,
          energy_style,
          communication_style,
          love_language,
          ideal_weekend,
          year_of_study
        ),
        female_user:female_user_id (
          id,
          full_name,
          age,
          university,
          profile_photo,
          bio,
          energy_style,
          communication_style,
          love_language,
          ideal_weekend,
          year_of_study
        )
      `).or(`male_user_id.eq.${r.id},female_user_id.eq.${r.id}`).order("created_at",{ascending:!1});if(a)return console.error("Supabase error:",a),i.Z.json({error:"Failed to fetch temporary matches"},{status:500});let s=(t||[]).map(e=>({...e,status:"active",male_disengaged:!1,female_disengaged:!1,revealed_at:e.created_at}));return i.Z.json({matches:s})}catch(e){return console.error("Temporary matches fetch error:",e),i.Z.json({error:"Internal server error"},{status:500})}}let c=s.AppRouteRouteModule,_=new c({definition:{kind:o.x.APP_ROUTE,page:"/api/user/temporary-matches/route",pathname:"/api/user/temporary-matches",filename:"route",bundlePath:"app/api/user/temporary-matches/route"},resolvedPagePath:"/home/aman/Desktop/cufy_3.1v/app/api/user/temporary-matches/route.ts",nextConfigOutput:"",userland:a}),{requestAsyncStorage:y,staticGenerationAsyncStorage:x,serverHooks:f,headerHooks:g,staticGenerationBailout:h}=_,q="/api/user/temporary-matches/route"}};var r=require("../../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),a=r.X(0,[4650,8336,6886,3433,3810,7221,4901,9542],()=>t(76955));module.exports=a})();