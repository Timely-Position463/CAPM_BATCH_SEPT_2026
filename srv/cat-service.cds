using {POApplication.db as db} from '../db/schema';
using {POApplication.common as common} from '../db/common';

service CatalogService {
    //Master data which is in master context
    @Capabilities : { 
        InsertRestrictions.Insertable : true,
        UpdateRestrictions.Updatable : true,
        ReadRestrictions.Readable:true
     }
    entity EmployeeSrv as projection on db.master.Employees{
        *
    }actions{
        action increaseSalary() returns array of EmployeeSrv;
        function Top20HighestPaidEmployees() returns array of EmployeeSrv;
    };

    entity ProductsSrv as projection on db.master.Products{
        *
    }actions{
        action increasePrice() returns array of ProductsSrv;
        function getTopProducts() returns array of ProductsSrv;
    };

    entity BusinessPartnerSrv as projection on db.master.BusinessPartners;

    entity AddressSrv as projection on db.master.Addresses;

    //Transactional data which is in transaction context
    entity PurchaseOrderSrv as projection on db.transaction.PurchaseOrders{
        *
    }actions{
        action discountPrice() returns array of PurchaseOrderSrv;
        function largestOrder() returns array of PurchaseOrderSrv;
    };

    entity PurchaseItemsSrv as projection on db.transaction.PurchaseItems;

    action createEmployee (
                        ID: UUID,
                        accountNumber:common.String32,
                        bankId: String(16),
                        email:common.Email,
                        gender:common.Gender,
                        language:String(2),
                        loginName:String(16),
                        nameFirst:common.String64,
                        nameInitials:common.String64,
                        nameLast:common.String64,
                        nameMiddle:common.String64,
                        phoneNumber:common.PhoneNumber,
                        salaryAmount:common.AmountT,
                        Currency_code:String(3)) returns array of EmployeeSrv;

    action updateEmployee(
        ID:UUID,
        salaryAmount: common.AmountT,
        Currency_code:String(3)
    ) returns String;

    action deleteEmployee(
        ID:UUID
    ) returns String;

    action createAddress(
        NODE_KEY:common.Guid,
        ADDRESS_TYPE:common.String32,
        VAL_START:Date,
        VAL_END:Date,
        LATITUDE:Decimal,
        LONGITUDE:Decimal
        ) returns array of AddressSrv;

    action updateAddress(
        NODE_KEY:common.Guid,
        ADDRESS_TYPE:common.String32
    )returns String;

    action createProduct(
        NODE_KEY:common.Guid,
        PRODUCT_ID:common.String32,
        TYPE_CODE:String(2),
        CATEGORY:common.String32,
        DESCRIPTION:common.String255,
        TAX_TARIF_CODE:Integer,
        MEASURE_UNIT:String(2),
        WEIGHT_MEASURE:Decimal(5,2),
        WEIGHT_UNIT:String(2),
        PRICE:Decimal(15,2),
        CURRENCY_CODE:String(5),
        WIDTH:Decimal(5,2),
        DEPTH:Decimal(5,2),
        HEIGHT:Decimal(5,2),
        DIM_UNIT:String(2)
    ) returns array of ProductsSrv;

    action updateProduct(
        NODE_KEY:common.Guid,
        CATEGORY:common.String32,
        DESCRIPTION:common.String255
    ) returns String;

    action deleteProduct(
        NODE_KEY:common.Guid
    )returns String;

    // Implementation of custom function
    function getHighestSalariedEmployees()returns array of EmployeeSrv;
    function getHighestPricedProducts()returns array of ProductsSrv;
    
    function getUtilities() returns String;
};

  