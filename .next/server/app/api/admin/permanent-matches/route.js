"use strict";(()=>{var e={};e.id=4978,e.ids=[4978],e.modules={30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},13685:e=>{e.exports=require("http")},95687:e=>{e.exports=require("https")},85477:e=>{e.exports=require("punycode")},12781:e=>{e.exports=require("stream")},57310:e=>{e.exports=require("url")},59796:e=>{e.exports=require("zlib")},73969:(e,r,t)=>{t.r(r),t.d(r,{headerHooks:()=>f,originalPathname:()=>v,requestAsyncStorage:()=>l,routeModule:()=>c,serverHooks:()=>_,staticGenerationAsyncStorage:()=>h,staticGenerationBailout:()=>g});var a={};t.r(a),t.d(a,{GET:()=>u,dynamic:()=>m,revalidate:()=>p}),t(95655);var n=t(83323),i=t(54647),o=t(66886),s=t(93439);let m="force-dynamic",p=0;async function u(e){try{let{data:e,error:r}=await s.p.from("permanent_matches").select(`
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
      `).order("created_at",{ascending:!1});if(r)return console.error("Permanent matches error:",r),o.Z.json({matches:[]});let t=(e||[]).map(e=>({...e,male_accepted:!0,female_accepted:!0,is_active:!0,male_disengaged:!1,female_disengaged:!1}));return o.Z.json({matches:t})}catch(e){return console.error("Permanent matches fetch error:",e),o.Z.json({matches:[]})}}let d=n.AppRouteRouteModule,c=new d({definition:{kind:i.x.APP_ROUTE,page:"/api/admin/permanent-matches/route",pathname:"/api/admin/permanent-matches",filename:"route",bundlePath:"app/api/admin/permanent-matches/route"},resolvedPagePath:"/home/aman/Desktop/cufy_3.1v-1/app/api/admin/permanent-matches/route.ts",nextConfigOutput:"",userland:a}),{requestAsyncStorage:l,staticGenerationAsyncStorage:h,serverHooks:_,headerHooks:f,staticGenerationBailout:g}=c,v="/api/admin/permanent-matches/route"}};var r=require("../../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),a=r.X(0,[9195,6886,3433,7221],()=>t(73969));module.exports=a})();