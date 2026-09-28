module.exports=cds.service.impl(async function(){
    //step-1: Declare Employee Service from entities
    const { EmployeeSrv, AddressSrv, ProductsSrv, PurchaseOrderSrv } = this.entities;
    const {uuid, decodeURI, mkdirp, copydirp, exists, isdir, read}=cds.utils;

    //Implementation of an action
    //There are three generic handlers
    // .before() : Pre-check and validation
    // .on() : Performing DB operations
    // .after() : To save / close connections

    this.before('UPDATE',EmployeeSrv,async(req,res)=>{
        const salaryAmt=req.data.salaryAmount;
        if(salaryAmt>100000){
            req.error(500,'Please get the approval from your line manager');
        }
    })

    this.on('createEmployee',async(request,response)=>{
        //Step-2 : Get the data which is coming from the API
        const empData= request.data;

        //Step-3: Instantiate the transaction object
        const objTransaction=cds.tx(request);

        //Step-4: Insert the record into database
        let returnData= await objTransaction.run([
            INSERT.into(EmployeeSrv).entries(empData)
        ]).then((resolve,reject)=>{
            if(typeof resolve !==undefined){
                return request.data;
            }else{
                request.error(500,"Error in inserting data into the database");
            }
        }).catch(err=>{
            request.error("There is an error: ",err.toString());
        })

        //Step-5: Return the data
        return returnData;
    })

    this.on('updateEmployee',async(req,res)=>{
        const {
            ID,
            salaryAmount,
            Currency_code
        }=req.data;

        try {
            const objTransaction=cds.tx(req);
            await objTransaction.update(EmployeeSrv).with({
                salaryAmount:salaryAmount,
                Currency_code: Currency_code
            }).where({
                ID:ID
            })
            return "Successfully updated!";
        } catch (error) {
            req.error("Error",error);
        }
    })    

    this.on('createAddress',async(request,response)=>{
        const addrData= request.data;
        const objTransaction=cds.tx(request);

        let returnData= await objTransaction.run([
            INSERT.into(AddressSrv).entries(addrData)
        ]).then((resolve,reject)=>{
            if(typeof resolve !==undefined){
                return request.data;
            }else{
                request.error(500,"Error in inserting data into the database");
            }
        }).catch(err=>{
            request.error("There is an error: ",err.toString());
        })
       return returnData;
    })

    this.on('updateAddress',async(req,res)=>{
        const{
            NODE_KEY,
            ADDRESS_TYPE
        }=req.data;

        try {
        let ObjTransaction=cds.tx(req);
        await ObjTransaction.update(AddressSrv).with({
            ADDRESS_TYPE:ADDRESS_TYPE
        }).where({
            NODE_KEY:NODE_KEY
        })
          return "Successfully updated";
        } catch (error) {
          console.error("Error occured updating Address: ",error);  
        }
    })

    this.on('deleteAddress',async(req,res)=>{
        const {
            ID
        }=req.data;
        try {
        const ObjTransaction=cds.tx(req);
        await ObjTransaction.delete(AddressSrv).where({
            ID:ID
        })
        return "Successfully Deleted";  
        } catch (error) {
            req.error("Error deleting Employee",error);
        }
    })

    this.on('createProduct',async(req,res)=>{
        const ProdData=req.data;
        const ObjTransaction=cds.tx(req);
        let returnData= await ObjTransaction.run([
           INSERT.into(ProductsSrv).entries(ProdData)
           ]).then((resolve,reject)=>{
           if(typeof resolve!== undefined){
                console.log(req.data);
                return req.data;
           }
           else{
               req.error(500,'Error inserting data into Products table');
            }
           }).catch(err=>{
            console.log("Error creating Products",err)
                req.error('Error creating Products: ',err);
        });
        return returnData;
    });

    this.before('UPDATE',ProductsSrv,async(req,res)=>{
        const price=req.data.PRICE;
        if(price>500){
            req.error(500,'You can\'t have discount for this product');
        }
    })

    this.on('updateProducts',async(req,res)=>{
        const {
                NODE_KEY,
                CATEGORY,
                DESCRIPTION
            }=req.data;
        try{
            let ObjTransaction=cds.tx(req);
            let returnData=ObjTransaction.update(ProductsSrv).with({
                PRODUCT_ID: PRODUCT_ID,
                TYPE_CODE: TYPE_CODE,
                CATEGORY: CATEGORY,
                DESCRIPTION: DESCRIPTION,
                TAX_TARIF_CODE: TAX_TARIF_CODE,
                MEASURE_UNIT: MEASURE_UNIT,
                WEIGHT_UNIT: WEIGHT_UNIT,
                PRICE: PRICE,
                CURRENCY_CODE: CURRENCY_CODE,
                WIDTH: WIDTH,
                DEPTH: DEPTH,
                HEIGHT: HEIGHT,
                DIM_UNIT: DIM_UNIT
            }).where({NODE_KEY: NODE_KEY});
            return "Products data successfully updated"
        }catch(err){
            req.err("Error updating Products: ",err);
        };
    })

    this.on('deleteProduct',async(req,res)=>{
        const{NODE_KEY}=req.data;
        try {
        let objTransaction=cds.tx(req);
        await objTransaction.delete(ProductsSrv).where({NODE_KEY:NODE_KEY});
        return "Product Successfully deleted";
    }
     catch (error) {
            req.error('Error Deleting the Product: ',error);
        }
    })

    this.before('UPDATE',AddressSrv,async(req)=>{
        const country=req.data.country;
        if(country && !['GB','US'].includes(country)){
            return req.reject(400,'Please contact your admin');
        }
    })
    
    this.on('getHighestSalariedEmployees',async(req,res)=>{
        try {
            const transaction=cds.tx(req);
            const res=await transaction.read(EmployeeSrv).orderBy({
                salaryAmount:'desc'
            }).limit(10);
            return res;
        } catch (error) {
            req.error('Error : ',error);
        }
    })
    this.on('getHighestPricedProducts',async(req,res)=>{
        try {
            const transaction=cds.tx(req);
            const res=await transaction.read(ProductsSrv).orderBy({
                PRICE:'desc'
            }).limit(10);
            return res;
        } catch (error) {
            req.error(500,'Error : ',error);
        }
    })

    this.on('discountPrice',async(req,res)=>{
        try {
            const ID=req.params[0].ID;
            const transaction=cds.tx(req);
            await transaction.update(PurchaseOrderSrv).with({
                GROSS_AMOUNT :{
                    '-=': 1000
                },
                NET_AMOUNT :{
                    '-=': 800
                },
                TAX_AMOUNT :{
                    '-=': 200
                }
            }).where(ID)
            const updatePOInfo = await transaction.read(PurchaseOrderSrv);
            return updatePOInfo;
        } catch (error) {
            return "Error: "+ error.toString();
        }
    })

    this.on('largestOrder',async(req,res)=>{
        try {
            const transaction=cds.tx(req);
            const reply=await transaction.read(PurchaseOrderSrv).orderBy({
                GROSS_AMOUNT:'desc'
            }).limit(5);
            return reply;
        } catch (error) {
            return "Error "+ error.toString();
        }
    })

    this.on('increasePrice',async(req,res)=>{
        try {
            const ID=req.params[0].ID;
            console.log(ID);
            const transaction=cds.tx(req);
            await transaction.update(ProductsSrv)
            .orderBy({
                '*=':1.10
            }).where({ID});
            return await transaction.read(ProductsSrv);
        } catch (error) {
            req.error(500,'Error',error);
        }
    })

    this.on('getTopProducts',async(req,res)=>{
        try {
            const transaction=cds.tx(req);
            await transaction.read(ProductsSrv)
            .orderBy({
                PRICE:'desc'
            })
            .limit(20);
        } catch (error) {
            req.error(500,'Error: ',error);
        }
    })
    
    this.on('increaseSalary',async(req,res)=>{
        const ID = req.params[0].ID;
        try {
        const transaction = cds.tx(req);
        await transaction.update(EmployeeSrv)
            .with({
                salaryAmount: {'*=': 1.15}
                })
            .where({ ID });
        return await transaction.read(EmployeeSrv)
            .where({ ID });
        } catch (error) {
        console.error(error);
        req.error(500, error.message);
        }
    })
    

    this.on('Top20HighestPaidEmployees',async(req,res)=>{
        try {
            const tran=cds.tx(req);
            const returnData=await tran.read(EmployeeSrv)
                .orderBy({
                    salaryAmount:'desc'
                })
                .limit(20)
            return returnData;  
        } catch (error) {
            req.error(500,'Error: ',error);
        }

    })

    this.on('getUtilities',async(req)=>{
        let vUUID=uuid(), vPackageContent=null, vInput='%20E4%20', uri, dirExists=false, isFileExists=false;

        if(exists('srv/cat-service.cds')){
            isFileExists=true;
        }
        if(isdir('app')){
            dirExists=true;
        }
        try {
            uri=decodeURI(vInput);
            await mkdirp('srv/lib')
        } catch (error) {
            uri=vInput;
        }

        vPackageContent=await read('package.json');

        var finalVal={
            uuid: vUUID,
            uri: uri,
            isFileExists: isFileExists,
            dirExists: dirExists,
            packageInfo: vPackageContent,
        }
        return finalVal;
    })
})