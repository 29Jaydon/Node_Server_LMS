 export function CurrentDateFormat(){
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; 
    var yyyy = today.getFullYear();
    if(dd<10) 
    {
        dd='0'+dd;
    } 

    if(mm<10) 
    {
        mm='0'+mm;
    } 

    today = mm+'-'+dd+'-'+yyyy;
    return today;
}

export function calculateFine(date1, date2){

    if (date1 === 'No due date issued'){
        fine = 'No fine';

    } else{
        let diff_in_time = date2.getTime() - date1.getTime();
        let diff_in_days =Math.round(diff_in_time/ (1000*60*60*24));
        fine = diff_in_days*10;
    }
    return fine;   
}


