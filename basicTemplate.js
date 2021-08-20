var workerCount = 2
var OutpostEnergyThreshold = 500
var chargeOutpostThress=2
var count = 0

for (spirit of my_spirits){
    
    
    if (count > workerCount){
        spirit.set_mark("attackbase")
    }

    if (spirit.energy == spirit.energy_capacity){
		if(count>chargeOutpostThress){
		    if(outpost.control != "help"){
		        if(outpost.energy < OutpostEnergyThreshold){
		            spirit.set_mark("chargingOutpost")
		        } else{
		            spirit.set_mark("chargingBase")
		        }
		        
		    }
		}
        else{
		   spirit.set_mark("chargingBase")
	    }
    }
		
     if (spirit.mark == "jobless"){
	    if (star_p89.energy > star_zxq.energy){
	        spirit.set_mark("harvestingP89")   
	    }else{
	        spirit.set_mark("harvestingZXQ")  
	    }
	}

	if (spirit.mark == "chargingOutpost"){
	    spirit.move(outpost.position)
    	spirit.energize(outpost)
    	if (spirit.energy == 0){
    	    spirit.set_mark("jobless")
    	}
	}
        
    if (spirit.mark == "chargingBase"){
	    spirit.move(base.position)
    	spirit.energize(base)
    	if (spirit.energy == 0){
    	    spirit.set_mark("jobless")
    	}
	}	

	
	
	if (spirit.mark == "harvestingP89"){
	    spirit.move(star_p89.position)
		spirit.energize(spirit)
	}
	if (spirit.mark == "harvestingZXQ"){
	    spirit.move(star_zxq.position)
		spirit.energize(spirit)
	}
	
	if (spirit.mark == "attackbase"){
	    spirit.move(enemy_base.position)
    	spirit.energize(enemy_base)
	}

	if (base.sight.enemies.length > 0){
    	var invader = spirits[base.sight.enemies[0]]
    	if (sprite.energy >= 20) sprite.set_mark("defender")
    	if (sprite.mark == "defender") {
    		sprite.move(invader.position)
    		sprite.energize(invader)
    	}
    }

   if (spirit.sight.enemies.length > 0){
    	var target = spirits[spirits.sight.enemies[0]]
    	if (sprite.energy >= 20) sprite.set_mark("defender")
    	if (sprite.mark == "defender") {
    		sprite.move(target.position)
    		sprite.energize(target)
    	}
    }
	
count++
spirit.shout(spirit.mark)
}