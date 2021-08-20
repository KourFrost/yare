var MaxHarvesterCount = 1;
var MaxWorkerCount = 2;
var OutpostEnergyThreshold = 650;
var attackThreshold = 6;
var chargeOutpostThress = 2;
var molesterThreshold = 4;
var molesterEnergyJump = 0.7;
var count = 0;
var harvest = true;
var user = "help";
var jobs = ["harvester", "worker", "solider", "molester", "defender"];

function distance(a, b) {
    let x = a[0] - b[0];
    let y = a[1] - b[1];
    return Math.sqrt(x * x + y * y);
}

function normalized(a) {
    let dist = distance(a, [0, 0]);
    return [a[0] / dist, a[1] / dist];
}

function vec_mul(a, b) {
    return [a[0] * b, a[1] * b];
}

function vec_sub(a, b) {
    return [a[0] - b[0], a[1] - b[1]];
}

function vec_add(a, b) {
    return [a[0] + b[0], a[1] + b[1]];
}

function vec_midpoint(a,b){
    let x = (b[0]-a[0])*0.5 + a[0]; 
    let y = (b[1]-a[1])*0.5 + a[1]; 
    return [x,y]
}

function harvest(s, loc) {
    s.move(loc.position);
    s.energize(s);
}

function ener(target) {
    s.move(target.position);
    s.energize(target);
}

function roleCount(role) {
    var i = 0;
    for (s of my_spirits) {
        var isAlive = s.hp == 1
        var isRole = s.mark == role
        if (isAlive) {
            if (isRole) {
                i++;
            }
        }
    }
    return i;
}

function determineClosestStar(){
    var distToZXQ = distance(s.position, star_zxq.position);
    var distToA1C = distance(s.position, star_a1c.position);
    var isStarA1cCloser = distToA1C < distToZXQ
    
    if (isStarA1cCloser) {
        return star_a1c.position;
    } else {
        return star_zxq.position;
    }
}


function dtrClosestStar(){
    var distToZXQ = distance(s.position, star_zxq.position);
    var distToA1C = distance(s.position, star_a1c.position);
    var isStarA1cCloser = distToA1C < distToZXQ
    if (isStarA1cCloser) {
        return star_a1c;
    } else {
        return star_zxq;
    }
}


function determineHarvestLoc(s) {
    var distToZXQ = distance(s.position, star_zxq.position);
    var distToP89 = distance(s.position, star_p89.position);
    var distToA1C = distance(s.position, star_a1c.position);
    var isOnStarA1cHalf = distToA1C < distToZXQ
    var isStarP89CloserThanA1C = distToP89 < distToA1C
    var isStarP89CloserThanP89 = distToP89 < distToZXQ
    
    
    if (isOnStarA1cHalf) {
        if (isStarP89CloserThanA1C) {
            return star_p89.position;
        } else {
            return star_a1c.position;
        }
    } else {
        if (isStarP89CloserThanP89) {
            return star_p89.position;
        } else {
            return star_zxq.position;
        }
    }
}

function harvesterRoutine(s,count) {
    var dist = distance(s.position, base.position);
   
    if (count>=3 && base.sight.enemies.length <= 0){
      
        var harvesLoc = determineHarvestLoc(s);
        var midpoint = vec_midpoint(base.position, harvesLoc)
        var optLoc = vec_midpoint(base.position, midpoint)

        s.move(optLoc)
        if(s.energy>50){
            s.energize(base);
        }
        
    }else if (s.energy == s.energy_capacity && dist > 200) {
        s.move(base.position);
    } else if (s.energy != 0 && dist < 200.0) {
        s.energize(base);
    } else {
        var harvesLoc = determineHarvestLoc(s);
        if (distance(s.position, harvesLoc) > 200) {
            s.move(harvesLoc);
        } else {
            s.energize(s);
        }

        //harvest(s, star_zxq);
    }
}

function workerRoutine(s, count, designation, harv, mid) {
    var hasEconCount = count >= 3 
    var dist = distance(s.position, base.position);

    if (s.sight.enemies.length > 0 && s.sight.structures.length > 0) {
 
        if (s.energy > 50) {
            
            ener(spirits[s.sight.enemies[0]]);
        } else {
            var harvesLoc = determineHarvestLoc(s);
            s.move(harvesLoc);
            s.energize(s);
        }
    } else if(hasEconCount){
        var closestStar = dtrClosestStar()
        
        
        
        if (designation == 1){
            
            var harvesLoc = determineClosestStar();
            var midpoint = vec_midpoint(base.position, harvesLoc)
            if(s.position !== midpoint){
                s.move(midpoint)
            } 
            if (s.energy > 90){
                 s.energize(spirits[harv]);
            }
           
            
        }else if(designation == 2 ){
           
            var harvesLoc = determineClosestStar();
            var midpoint = vec_midpoint(base.position, harvesLoc)
            var optLoc = vec_midpoint(harvesLoc, midpoint)
            if(s.position !== midpoint){
                s.move(optLoc)           
            } 
            if(s.energy>90){
                s.energize(spirits[mid]);
                // s.energize(spirits[mid]);
            }else{
                s.energize(spirits[s.id]);
            }
            
        }else if(designation == 3 && closestStar.energy > 500 ){
            
            
            console.log(closestStar.id)
            console.log(closestStar.energy)
            
            var harvesLoc = determineClosestStar();
            var midpoint = vec_midpoint(base.position, harvesLoc)
            var optLoc = vec_midpoint(harvesLoc, midpoint)
            if(s.position !== midpoint){
                s.move(optLoc)           
            } 
            if(s.energy>90){
                s.energize(spirits[mid]);
                // s.energize(spirits[mid]);
            }else{
                s.energize(spirits[s.id]);
            }
        }else{
            if (s.energy == s.energy_capacity && dist > 200) {
                s.move(base.position);
            } else if (s.energy != 0 && dist < 200.0) {
                s.energize(base);
            } else {
                var harvesLoc = star_p89.position;
                if (distance(s.position, harvesLoc) > 200) {
                    s.move(harvesLoc);
                } else {
                    s.energize(s);
                }
            }
        }
        
    }else if (s.energy == s.energy_capacity && dist > 200) {
        s.move(base.position);
    } else if (s.energy != 0 && dist < 200.0) {
        s.energize(base);
    } else {
        var harvesLoc = determineHarvestLoc(s);
        if (distance(s.position, harvesLoc) > 200) {
            s.move(harvesLoc);
        } else {
            s.energize(s);
        }
    }
}

function soliderRoutine(s, sCount, invaders) {
    if (s.sight.enemies.length > 0) {
        if (s.energy > 20) {
            ener(spirits[s.sight.enemies[0]]);
        } else {
            var harvesLoc = determineHarvestLoc(s);
            s.move(harvesLoc);
            s.energize(s);
        }
    } else if (s.energy >= s.energy_capacity * 0.7) {
        if (
            outpost.control != user ||
            outpost.energy < OutpostEnergyThreshold
        ) {
            ener(outpost);
        } else if (sCount >= attackThreshold) {
            if (s.sight.enemies.lenght > 0) {
                ener(spirits[s.sight.enemies[0]]);
            } else {
                ener(enemy_base);
            }
        } else {
            ener(base);
        }
    } else {
        if (s.sight.structures.indexOf("base") !== -1) {
            ener(base);
        } else if (
            s.sight.structures.indexOf("outpost") !== -1 &&
            s.energy > energy_capacity * molesterEnergyJump
        ) {
            ener(outpost);
        } else {
            var harvesLoc = determineHarvestLoc(s);
            s.move(harvesLoc);
            s.energize(s);
        }
    }
}

function molesterRoutine(s) {
    var hasFullEnergy = s.energy == s.energy_capacity;
    var inSightOfEnemyBase = enemy_base.sight.enemies.includes(s.id);
    var hasLowEnergy = s.energy < s.energy_capacity * molesterEnergyJump;
    // console.log("EBase:" + enemy_base.sight.enemies[0])
    // console.log("id: "+s.id)
    // console.log("baseSight: " +inSightOfEnemyBase)
    // console.log("retreatBool: "+s.retreat)

    if (hasFullEnergy) {
        s.retreat = false
        if (!inSightOfEnemyBase) {
            s.move(enemy_base.position);
        } else if (s.sight.enemies.length > 0) {
           s.energize(spirits[s.sight.enemies[0]])
        // ener(spirits[s.sight.enemies[0]]);
        } 
        
    }else if (!hasLowEnergy && !s.retreat) 
    {
        s.retreat = false
        if (!inSightOfEnemyBase) {
            s.move(enemy_base.position);
        } else if (s.sight.enemies.length > 0) {
           s.energize(spirits[s.sight.enemies[0]])
        // ener(spirits[s.sight.enemies[0]]);
        } 
    }
    else if (hasLowEnergy && !s.retreat) {
        s.retreat = true
        s.jump(star_p89.position);
        
    }else{
        s.move(star_p89.position);
        s.energize(s);
    }
}

function tota

fucntion energyCollectionRate(){

}

var harvesterCount = roleCount("harvester");
var workerCount = roleCount("worker");
var soliderCount = roleCount("solider");
var molesterCount = roleCount("molester");
var invadersList;

if (tick == 0){
    memory.getTotalEnergy = 300;
}

var totalEnergy = memory.getTotalEnergy();


console.log("start");
console.log("harvesterCountCount: " + harvesterCount);
console.log("workerCount: " + workerCount);
console.log("soliderCount: " + soliderCount);
console.log("molesterCount: " + molesterCount);

var econCount = workerCount+ harvesterCount;

//check if base is under attack flag
// var enemiesNearBase = base.sight.enemies.length;

// if (enemiesNearBase > 0) {
//     invadersList = base.sight.enemies;
// }

// if (outpost.control == user) {
//     invadersList = +outpost.sight.enemies;
// }

// //check if any enemy is in sight
// for (s of my_spirits) {
//     if (s.hp == 1 && s.mark == "worker") {
//         invadersList = +s.sight.enemies;
//     }
// }
var workerDesg = 0
for (s of my_spirits) {
    if (s.hp == 1) {
        if (harvesterCount == 0) {
            s.set_mark("harvester");
            harvesterCount++;
        }
        if (s.energy == s.energy_capacity && jobs.indexOf(s.mark) == -1) {
            if (workerCount <= MaxWorkerCount) {
                s.set_mark("worker");
                workerCount++;
            } else if (
                workerCount + soliderCount + harvesterCount >=
                    molesterThreshold &&
                outpost.control == user &&
                molesterCount < 1
            ) {
                s.set_mark("molester");
                molesterCount++;
            } else if(workerCount + soliderCount + harvesterCount >=
                    molesterThreshold-1 && workerCount <4){
                         s.set_mark("worker");
                workerCount++;
            } else {
                s.set_mark("solider");
                soliderCount++;
            }
        }

        

        if (s.mark == "harvester") {
         
            memory.harvesterID = s.id
            harvesterRoutine(s, econCount);

        }

        if (s.mark == "worker") {
            workerDesg++
            if (workerDesg == 1)
            {
                memory.workerId = s.id
            }
            workerRoutine(s, econCount, workerDesg, memory.harvesterID, memory.workerId);
        }
        if (s.mark == "solider") {
            soliderRoutine(s, soliderCount, invadersList);
        }
        if (s.mark == "molester") {
            molesterRoutine(s);
        }
        s.shout(s.mark)
    }
}console.log("End");