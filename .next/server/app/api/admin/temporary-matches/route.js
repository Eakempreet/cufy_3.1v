"use strict";(()=>{var e={};e.id=5169,e.ids=[5169],e.modules={30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},13685:e=>{e.exports=require("http")},95687:e=>{e.exports=require("https")},85477:e=>{e.exports=require("punycode")},12781:e=>{e.exports=require("stream")},57310:e=>{e.exports=require("url")},59796:e=>{e.exports=require("zlib")},88942:(e,r,a)=>{a.r(r),a.d(r,{headerHooks:()=>y,originalPathname:()=>g,requestAsyncStorage:()=>c,routeModule:()=>l,serverHooks:()=>_,staticGenerationAsyncStorage:()=>h,staticGenerationBailout:()=>f});var t={};a.r(t),a.d(t,{GET:()=>u,dynamic:()=>m,revalidate:()=>p}),a(95655);var o=a(83323),i=a(54647),s=a(66886),n=a(93439);let m="force-dynamic",p=0;async function u(e){try{let{data:e,error:r}=await n.p.from("temporary_matches").select(`
        *,
        male_user:male_user_id (
          id,
          full_name,
          age,
          university,
          profile_photo
        ),
        female_user:female_user_id (
          id,
          full_name,
          age,
          university,
          profile_photo
        )
      `).order("created_at",{ascending:!1});if(r)return console.error("Temporary matches error:",r),s.Z.json({matches:[]});let a=(e||[]).map(e=>({...e,male_disengaged:e.male_disengaged||!1,female_disengaged:e.female_disengaged||!1,expires_at:e.expires_at||null}));return s.Z.json({matches:a})}catch(e){return console.error("Temporary matches fetch error:",e),s.Z.json({matches:[]})}}let d=o.AppRouteRouteModule,l=new d({definition:{kind:i.x.APP_ROUTE,page:"/api/admin/temporary-matches/route",pathname:"/api/admin/temporary-matches",filename:"route",bundlePath:"app/api/admin/temporary-matches/route"},resolvedPagePath:"/home/aman/Desktop/cufy_3.1v-1/app/api/admin/temporary-matches/route.ts",nextConfigOutput:"",userland:t}),{requestAsyncStorage:c,staticGenerationAsyncStorage:h,serverHooks:_,headerHooks:y,staticGenerationBailout:f}=l,g="/api/admin/temporary-matches/route"}};var r=require("../../../../webpack-runtime.js");r.C(e);var a=e=>r(r.s=e),t=r.X(0,[9195,6886,3433,7221],()=>a(88942));module.exports=t})();