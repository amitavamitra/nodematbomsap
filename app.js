// import npm packages
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const app = express();
const fs = require('fs');
const https = require('https');

const rfcClient = require("node-rfc").Client; 
require('dotenv').config();

const materialarray = require('./materialarray.json');

const bom = require('./bom.json');
var components = bom.components;
// console.log(components[0].item_categ);


// material.forEach(material => {
//   console.log(material.matnr , material.matkx)
// });
//  define the app on express middleware
//  we set public to be our static resources 
//  folder for the project
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:true}));
// we use ejs as rendering engine
// for this package we need a views folder 
// we define all ui/html pages in this folder
app.set('view engine' , 'ejs');


// **********************Log onto S4 *****************

const abapConnection = {
  dest:'S4H',
  user:process.env.USER,
  passwd:process.env.PASSWORD,
  ashost: process.env.AHOST,
  sysnr: "00",
  client: "100",
};
 
// create new client
const client = new rfcClient(abapConnection);

// echo SAP NW RFC SDK and nodejs/RFC binding version
console.log("Client version: ", client.version);

// open connection
client.connect(function(err) {
  
  if (err) {
    return console.error("could not connect to server",err);
  } else {
    console.log('Logged on to System:' + abapConnection.dest + " client " +abapConnection.client)
  }
var timest = new Date().getUTCMinutes();

//   // invoke ABAP function module, passing structure and table parameters

});  // Dont comment this one..

//***********************Log onto S4 *****************

// On user approval - call S/4 via node-rfc

app.get('/',function(req,res){
  res.render('home');
})

app.post('/' , function(req,res){

//  Life is chain of promise and we keep it till the end.
//  For any rejection we catch it and deal with it..
// art().then(new_artifact => {
//   console.log('Artifact registered :' ,new_artifact)
//   return conf();
// }).then(new_config => {
//   console.log('Configuration created :' ,new_config)
//   return trigger_execution();
//  }).then(new_exec => {
//   console.log('Execution triggered :' ,new_exec)
//  }).catch(err => {
//    console.log(err);
//  })
materialarray.forEach(material => {
  console.log(material);
  materialcreate(material);
});


//**************************************** */
// bomcreate(bom);
// ****************************************/
 
})

app.listen(4000,function(){
    console.log('Text2Entity App is running at port 4000')
})
function materialcreate(material) {
  //   // invoke ABAP function module, passing structure and table parameters
      
      const headdata = {
      MATERIAL        :       material.matnr,
      IND_SECTOR      :       material.mbrsh,
      MATL_TYPE       :       material.matyp,
      BASIC_VIEW      :       "X",
      MRP_VIEW        :       "X",
      MATERIAL_LONG   :      material.matnr
          };
  const clientdata  = {
      OLD_MAT_NO     :   material.matkx,
      BASE_UOM       :   material.meins,
      MATL_GROUP     :   material.matkl,
      NET_WEIGHT     :   '10',
      UNIT_OF_WT     :    'G'
      };
  const clientdatax  = {
      OLD_MAT_NO     :    "X",
      BASE_UOM       :    "X",
      MATL_GROUP     :    "X",
      NET_WEIGHT     :    'X',
      UNIT_OF_WT     :    'X' 
      };
  
  const    MATERIALDESCRIPTION = [{
  
      LANGU        :         "EN",
      LANGU_ISO    :          "EN",
      MATL_DESC    :        material.matkx
  
  },
  {
    LANGU        :         "DE",
    LANGU_ISO    :          "DE",
    MATL_DESC    :        material.matkx
  }
];

const  PLANTDATA = {
  PLANT : '0001',
  PROC_TYPE : 'EX',
  MRP_TYPE : 'PD',
  MRP_CTRLER : '001',
  LOTSIZEKEY : 'EX',
  AVAILCHECK : 'KP'
};


const  PLANTDATAX = {
  PLANT : '0001',
  PROC_TYPE : 'X',
  MRP_TYPE : 'X',
  MRP_CTRLER : 'X',
  LOTSIZEKEY : 'X',
  AVAILCHECK : 'X'
};

const UNITSOFMEASURE = [{
ALT_UNIT : 'EA',
ALT_UNIT_ISO :'EA',
NUMERATOR : '1',
DENOMINATR: '1',
LENGTH :'100',
WIDTH : '80',
HEIGHT:'20',
UNIT_DIM:'CM',
GROSS_WT:'11',
UNIT_OF_WT:'G'
}];

const UNITSOFMEASUREX = [{
  ALT_UNIT : 'EA',
  ALT_UNIT_ISO :'EA',
  NUMERATOR : 'X',
  DENOMINATR: 'X',
  LENGTH :'X',
  WIDTH : 'X',
  HEIGHT:'X',
  UNIT_DIM:'X',
  GROSS_WT:'X',
  UNIT_OF_WT:'X'
  }];


  
          client.invoke(
          "BAPI_MATERIAL_SAVEDATA",
          { HEADDATA: headdata ,
            CLIENTDATA: clientdata,
            CLIENTDATAX:clientdatax,
            MATERIALDESCRIPTION: MATERIALDESCRIPTION,
            PLANTDATA: PLANTDATA,
            PLANTDATAX: PLANTDATAX,
            UNITSOFMEASURE:UNITSOFMEASURE,
            UNITSOFMEASUREX:UNITSOFMEASUREX
           },
          function(err, res) {
              if (err) {
                  return console.error("Error invoking STFC_STRUCTURE:", err);
              }
              console.log("BAPI_MATERIAL_SAVEDATA call result:", res.RETURN.MESSAGE_V1);
               }
      ); 
  
  
}

function bomcreate(bom) {

  var components = bom.components;
  components.forEach(component => {
      const    stpodata = [{
        ITEM_CATEG: components[0].item_categ,
      ITEM_NO: components[0].item_no,
      COMPONENT:components[0].component,
      COMP_QTY:components[0].comp_qty,
      COMP_UNIT:components[0].comp_unit

}];  
    console.log(stpodata)
  client.invoke(
    "CSAP_MAT_BOM_CREATE",
    {
      MATERIAL : 'TXT2ENT10',
      PLANT: bom.werks,
      BOM_USAGE: '3',
      ALTERNATIVE : '',
      VALID_FROM : '08.06.2021', 
      T_STPO :  stpodata
    },
    function(err, res) {
      if (err) {
          return console.error("Error invoking STFC_STRUCTURE:", err);
      }
      console.log("CSAP_MAT_BOM_CREATE call result:", res);
  }
  );
  });

}