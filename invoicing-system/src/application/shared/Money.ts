export class Money{
   
    private readonly amount:number;
    private readonly currency:string;

    constructor(amount:number,currency:string){
        if(!Number.isInteger(amount) ){
            throw new Error ("amount must be an integer")
        }
        if(amount<0){
            throw new Error("amount must be greater than or equal to zero")
        }
        this.amount=amount;
        this.currency=currency
    }
    add(other:Money):Money {
        if(!this.sameCurrency(other)){
            return this.currencyMismatchError()
        }
        return new Money(this.amount + other.amount,this.currency)
    }
    getCurrency():string {
        return this.currency;
    }
    getAmount():number {
        return this.amount;
    }
    subtract(other:Money):Money {
        if(!this.sameCurrency(other)){
            return this.currencyMismatchError()
        }
        if(this.amount<other.amount){
            return this.insufficientFundsError()
        }
        return new Money(this.amount-other.amount,this.currency)
    }
    equals(other:Money):boolean {
        return this.amount===other.amount && this.currency===other.currency;
    }
    static zero(currency:string):Money {
        return new Money(0,currency);
    }
      sameCurrency(other:Money):boolean{
        return this.currency===other.currency;
    }
    currencyMismatchError():never{
        throw new Error("currency do not match")
    }
    insufficientFundsError():never {
        throw new Error("insufficient funds")
    }
}