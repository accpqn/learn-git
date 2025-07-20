"use strict";const e=require("./request.js"),t={get:()=>e.request({url:"/core/theme/",method:"GET"}),update:t=>e.request({url:"/core/theme/",method:"PATCH",data:t})};exports.themeApi=t;
