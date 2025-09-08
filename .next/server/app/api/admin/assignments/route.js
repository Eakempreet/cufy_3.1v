"use strict";(()=>{var e={};e.id=9726,e.ids=[9726],e.modules={30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},13685:e=>{e.exports=require("http")},95687:e=>{e.exports=require("https")},85477:e=>{e.exports=require("punycode")},12781:e=>{e.exports=require("stream")},57310:e=>{e.exports=require("url")},59796:e=>{e.exports=require("zlib")},45579:(e,r,t)=>{t.r(r),t.d(r,{headerHooks:()=>_,originalPathname:()=>h,requestAsyncStorage:()=>c,routeModule:()=>p,serverHooks:()=>f,staticGenerationAsyncStorage:()=>g,staticGenerationBailout:()=>v});var a={};t.r(a),t.d(a,{GET:()=>l,dynamic:()=>u,revalidate:()=>m}),t(95655);var s=t(83323),n=t(54647),i=t(66886),o=t(93439);let u="force-dynamic",m=0;async function l(e){try{let{data:e,error:r}=await o.p.from("profile_assignments").select(`
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
      `).order("created_at",{ascending:!1});if(r)return console.error("Assignments error:",r),i.Z.json({assignments:[]});let t=(e||[]).map(e=>({...e,status:e.status||"active",male_revealed:e.male_revealed||!1,female_revealed:e.female_revealed||!1}));return i.Z.json({assignments:t})}catch(e){return console.error("Assignments fetch error:",e),i.Z.json({assignments:[]})}}let d=s.AppRouteRouteModule,p=new d({definition:{kind:n.x.APP_ROUTE,page:"/api/admin/assignments/route",pathname:"/api/admin/assignments",filename:"route",bundlePath:"app/api/admin/assignments/route"},resolvedPagePath:"/home/aman/Desktop/cufy_3.1v-1/app/api/admin/assignments/route.ts",nextConfigOutput:"",userland:a}),{requestAsyncStorage:c,staticGenerationAsyncStorage:g,serverHooks:f,headerHooks:_,staticGenerationBailout:v}=p,h="/api/admin/assignments/route"}};var r=require("../../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),a=r.X(0,[9195,6886,3433,7221],()=>t(45579));module.exports=a})();