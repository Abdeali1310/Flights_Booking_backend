const compareDateAndTime = (t1,t2)=>{
    const time1 = new Date(t1);
    const time2 = new Date(t2);
    return time1.getTime() > time2.getTime();
}

module.exports = {compareDateAndTime}