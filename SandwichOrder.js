const Order = require("./Order");

const OrderState = Object.freeze({
    WELCOMING:   Symbol("welcoming"),
    CHOICE:   Symbol("choice"),
    TYPE:   Symbol("type"),
    TOPPINGS:   Symbol("toppings"),
    DRINKS:  Symbol("drinks"),
    SIDES:  Symbol("side"),
    PAYMENT: Symbol("payment")
});

module.exports = class SandwichOrder extends Order{
    constructor(sNumber, sUrl){
        super(sNumber, sUrl);
        this.stateCur = OrderState.WELCOMING;
        this.sChoice = "";
        this.sType = "";
        this.sToppings = "";
        this.sDrinks = "";
        this.sSides = "";
        this.sItem = "sandwich";
        this.sTotal = 0;
        this.sAddress = "";
    }
    handleInput(sInput){
        let aReturn = [];
        switch(this.stateCur){
            case OrderState.WELCOMING:
                this.stateCur = OrderState.CHOICE;
                aReturn.push("Welcome to Pierre and Konrad's Sandwichery.");
                aReturn.push("Would you like a premade sandwich?");
                aReturn.push("Enter Yes");
                break;
            case OrderState.CHOICE:
                if(sInput.toLowerCase() == "yes"){
                    this.stateCur = OrderState.TYPE
                    this.sChoice = sInput;
                    aReturn.push("What type of sandwich would you like?");
                    aReturn.push("Egg, Veggie, Ham");
                }
                else{
                  aReturn.push("Would you like a premade sandwich?");
                  aReturn.push("Enter Yes");
                }
                break;
            case OrderState.TYPE:
              if(sInput.toLowerCase() == "egg" || sInput.toLowerCase() == "veggie" || sInput.toLowerCase() == "ham"){
                  this.stateCur = OrderState.SIDES
                  this.sType = sInput;
                  aReturn.push("Whould you like a side with that? The soup of the day is Cauliflower Curry");
                  aReturn.push("Fries, Onion Rings, Ceasar Salad, Soup, none");
                  this.sTotal += 6;
              }
              else{
                aReturn.push("What type of sandwich would you like?");
                aReturn.push("Egg, Veggie, Ham");
              }
              break;
            case OrderState.SIDES:  
              if(sInput.toLowerCase() == "fries" || sInput.toLowerCase() == "onion rings" || sInput.toLowerCase() == "ceasar salad" || sInput.toLowerCase() == "soup"){
                this.stateCur = OrderState.DRINKS
                this.sSides = sInput;
                this.sTotal += 3;
                aReturn.push("What drink would you like with that?");
                aReturn.push("Orangina, SevenUp, DrPepper, water, none");
              }
              else if(sInput.toLowerCase() == "none"){
                this.stateCur = OrderState.DRINKS
                aReturn.push("What drink would you like with that?");
                aReturn.push("Orangina, SevenUp, DrPepper, water, none");
              }
              else{
                aReturn.push("Whould you like a side with that? The soup of the day is Cauliflower Curry");
                aReturn.push("Fries, Onion Rings, Ceasar Salad, Soup, none");
              }
              break;
            case OrderState.DRINKS:
              if(sInput.toLowerCase() == "orangina" || sInput.toLowerCase() == "sevenup" || sInput.toLowerCase() == "drpepper" || sInput.toLowerCase() == "water"){
                this.stateCur = OrderState.PAYMENT;
                this.sDrinks = sInput;
                this.sTotal += 2;
                aReturn.push("Thank-you for your order of");
                if(this.sChoice.toLowerCase() == "yes"){
                  aReturn.push(`The ${this.sType} ${this.sItem}`);
                }
                if(this.sSides){
                  aReturn.push(`with ${this.sSides}`);
                }
                if(this.sDrinks){
                    aReturn.push(`and with ${this.sDrinks}`);
                }
                aReturn.push(`This will cost $${this.sTotal}`);
                aReturn.push(`Please pay for your order here`);
                aReturn.push(`${this.sUrl}/payment/${this.sNumber}/`);
              }
              else if(sInput.toLowerCase() == "none"){
                this.stateCur = OrderState.PAYMENT;
                aReturn.push("Thank-you for your order of");
                if(this.sChoice.toLowerCase() == "yes"){
                  aReturn.push(`The ${this.sType} ${this.sItem}`);
                }
                if(this.sChoice.toLowerCase() == "custom"){
                    aReturn.push(`${this.sType} ${this.sItem} with ${this.sToppings}`);
                }
                if(this.sSides){
                  aReturn.push(`with ${this.sSides}`);
                }
                if(this.sDrinks){
                    aReturn.push(`and with ${this.sDrinks}`);
                }
                aReturn.push(`This will cost $${this.sTotal}`);
                aReturn.push(`Please pay for your order here`);
                aReturn.push(`${this.sUrl}/payment/${this.sNumber}/`);
              }
              else{
                aReturn.push("What drink would you like with that?");
                aReturn.push("Orangina, SevenUp, DrPepper, water, none");
              }
              break;
            case OrderState.PAYMENT:
                this.isDone(true);
                let d = new Date();
                d.setMinutes(d.getMinutes() + 20);
                aReturn.push(`Please pick it up at ${this.sAddress}our Restaurant on 50 William Street West Waterloo N1G 0E3 at ${d.toTimeString()}`);
                break;
        }
        return aReturn;
    }
    renderForm(){
      // your client id should be kept private
      const sClientID = process.env.SB_CLIENT_ID || 'Af5T4eHV4fMqlxy0rWMfFltbKPR2qjquK4iZ6C2aQ99cU_fH_g8fYg3W7Qkfu03rDsaeIQXgoMiW365z'
      return(`
      <!DOCTYPE html>
  
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1"> <!-- Ensures optimal rendering on mobile devices. -->
        <meta http-equiv="X-UA-Compatible" content="IE=edge" /> <!-- Optimal Internet Explorer compatibility -->
      </head>
      
      <body>
        <script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
        <script
          src="https://www.paypal.com/sdk/js?client-id=${sClientID}"> // Required. Replace SB_CLIENT_ID with your sandbox client ID.
        </script>
        Thank you ${this.sNumber} for your order of $${this.sTotal}.
        <div id="paypal-button-container"></div>
  
        <script>
          paypal.Buttons({
              createOrder: function(data, actions) {
                // This function sets up the details of the transaction, including the amount and line item details.
                return actions.order.create({
                  purchase_units: [{
                    amount: {
                      value: '${this.sTotal}'
                    }
                  }]
                });
              },
              onApprove: function(data, actions) {
                // This function captures the funds from the transaction.
                return actions.order.capture().then(function(details) {
                  // This function shows a transaction success message to your buyer.
                  $.post(".", details, ()=>{
                    window.open("", "_self");
                    window.close(); 
                  });
                });
              }
          
            }).render('#paypal-button-container');
          // This function displays Smart Payment Buttons on your web page.
        </script>
      
      </body>
          
      `);
  
    }
}
