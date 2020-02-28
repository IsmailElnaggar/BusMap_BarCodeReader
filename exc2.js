$(document).ready(function(){

    // Hide info on click
    $("#hide").click(function(){
        $("#hidearea").toggle("fast");
    });

    // White text box for Vcode box when not selected
    $("#code").blur(function(){
        $(this).css("background-color", "White");
    });

    // Grey text box for Vcode box when selected
    $("#code").focus(function(){
        $(this).css("background-color", "LightGray");
    });

    // Decode info on click of decode button
    document.getElementById("decode").onclick = function dec(){
        decode()
    }
});


/* function to decode virtual bar code */

function decode(){

    var code = document.getElementById("code").value;
    // remove white spaces from the start and end of string in case of a bad copy paste
    var code=code.trim()

    //Checks which version the code is
    if (code[0] == 4 || code[0] ==5) {
        // get iban and insert spaces between numbers
        $("#iban").val(code.slice(1, 3) + " " + code.slice(3, 7) + " " + code.slice(7, 11) + " " + code.slice(11, 15) + " " + code.slice(15, 17));
        /* remove 0s from euros */
        euros = code.slice(18, 23).replace(/^0+/, '');
        // If length is 0 euros = 0
        if (euros.length == 0) {
            euros = 0;
        }


        cents = code.slice(23, 25);
        // combine euro and cents for amount
        $("#amount").val(euros + "." + cents);

        if (code[0] == 4) {
            // if version 4, remove leading 0s
            $("#reference").val(code.slice(29, 48).replace(/^0+/, ''));
        }

        else {
            // else version 5: add RF and remove leading 0s
            $("#reference").val("RF" + code.slice(25, 27) + " " + code.slice(27, 48).replace(/^0+/, ''));
        }


        year = code.slice(48, 50);
        month = code.slice(50, 52);
        day = code.slice(52, 54);

        // if all date places are 00 then due date is None
        if (day == "00" && month == "00" && year == "00"){
            $("#duedate").val("None");
        }

        else {
            $("#duedate").val(day + "." + month + ".20" + year);
        }
        // use JsBarcode to create the barcode
        JsBarcode("#barcode", code, {format: "CODE128C"});
    }
    // if code is invalid display error in the payee's iban text box
    else {
        $("#iban").val("Invalid virtual bar code");
    }

}


/* Change display based on show and hide */

function changeDisplay(){
    var elem = document.getElementById("hide");
    if (elem.value=="Hide") {
        elem.value = "Show";
    }
    else {
        elem.value = "Hide";
    }
}