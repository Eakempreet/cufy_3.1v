"use strict";(()=>{var e={};e.id=5169,e.ids=[5169],e.modules={30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},13685:e=>{e.exports=require("http")},95687:e=>{e.exports=require("https")},85477:e=>{e.exports=require("punycode")},12781:e=>{e.exports=require("stream")},57310:e=>{e.exports=require("url")},59796:e=>{e.exports=require("zlib")},35719:(e,r,t)=>{t.r(r),t.d(r,{headerHooks:()=>P,originalPathname:()=>y,requestAsyncStorage:()=>c,routeModule:()=>l,serverHooks:()=>h,staticGenerationAsyncStorage:()=>_,staticGenerationBailout:()=>f});var a={};t.r(a),t.d(a,{GET:()=>p,dynamic:()=>m,revalidate:()=>u}),t(95655);var o=t(83323),i=t(54647),s=t(66886),n=t(93439);let m="force-dynamic",u=0;async function p(e){try{let{data:e,error:r}=await n.p.from("temporary_matches").select(`
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
      `).order("created_at",{ascending:!1});if(r)return console.error("Temporary matches error:",r),s.Z.json({matches:[]});let t=(e||[]).map(e=>({...e,male_disengaged:e.male_disengaged||!1,female_disengaged:e.female_disengaged||!1,expires_at:e.expires_at||null}));return s.Z.json({matches:t})}catch(e){return console.error("Temporary matches fetch error:",e),s.Z.json({matches:[]})}}let d=o.AppRouteRouteModule,l=new d({definition:{kind:i.x.APP_ROUTE,page:"/api/admin/temporary-matches/route",pathname:"/api/admin/temporary-matches",filename:"route",bundlePath:"app/api/admin/temporary-matches/route"},resolvedPagePath:"/home/aman/Desktop/cufy_3.1v/app/api/admin/temporary-matches/route.ts",nextConfigOutput:"",userland:a}),{requestAsyncStorage:c,staticGenerationAsyncStorage:_,serverHooks:h,headerHooks:P,staticGenerationBailout:f}=l,y="/api/admin/temporary-matches/route"},54647:(e,r)=>{var t;Object.defineProperty(r,"x",{enumerable:!0,get:function(){return t}}),function(e){e.PAGES="PAGES",e.PAGES_API="PAGES_API",e.APP_PAGE="APP_PAGE",e.APP_ROUTE="APP_ROUTE"}(t||(t={}))}};var r=require("../../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),a=r.X(0,[8336,6886,3433,7221],()=>t(35719));module.exports=a})();