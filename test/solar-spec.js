var expect = require('chai').expect;
var jssim = require('../src/jssim');

describe('Ball simulation', function(){
   it('should simulate balls collision and spring effect', function(){
        
        var sun_x = 400;
        var sun_y = 300;
        var SUN = 0;
        var PLUTO = 9;  // Furthest-out body
         // distance from sun in 10^5 km
        var DISTANCE =[0, 579, 1082, 1496, 2279, 7786, 14335, 28725, 44951, 58700]; 

        // diameters in 10 km
        var DIAMETER = [139200.0, 487.9, 1210.4, 1275.6, 679.4, 14298.4, 12053.6, 5111.8, 4952.8, 239.0];

        // period in days 
        var PERIOD = [1 /* don't care :-) */, 88.0, 224.7, 365.2, 687.0, 4331, 10747, 30589, 59800, 90588];

        var scale = 400 / DISTANCE[PLUTO];

        // improve the animation effect
        DIAMETER[SUN] = 5000;
        for(var i=0; i < DISTANCE.length; ++i) {
            DISTANCE[i] = scale * DISTANCE[i];
            PERIOD[i] /= 10;
            DIAMETER[i] = scale * DIAMETER[i] / 10.0;
        }




        var Body = function(id, velocity, distanceFromSun, space, scheduler) {
            jssim.SimEvent.call(this);
            this.velocity = velocity; 
            this.distanceFromSun = distanceFromSun; 
            this.scheduler = scheduler;
            this.space = space;
            this.id = id;
        };

        Body.prototype = Object.create(jssim.SimEvent.prototype);

        Body.prototype.update = function (deltaTime) {
            if (this.distanceFromSun > 0)  // the sun's at 0, and you can't divide by 0
            {
                var theta = ((this.velocity / this.distanceFromSun) * this.scheduler.current_time)%(2*Math.PI) ;  
                this.space.updateAgent(this, 
                    sun_x + this.distanceFromSun*Math.cos(theta), 
                    sun_y + this.distanceFromSun*Math.sin(theta));
            }
        };

        Body.prototype.draw = function(context, pos){
            if(this.id == SUN) {
                context.fillStyle = '#ff0000';
            } else {
                context.fillStyle = '#666666';
            }
            context.beginPath();
            context.arc(pos.x, pos.y, DIAMETER[this.id], 0, 2 * Math.PI);
            context.fill();

            context.fillStyle = '#ffffff';  
        };



        var scheduler = new jssim.Scheduler();

        var space = new jssim.Space2D();


        function reset() {
            scheduler.reset(); 
            space.reset();

            for(var i=0; i<10;i++)
            {
                var b = new Body(i, (2*Math.PI*DISTANCE[i]) / PERIOD[i], DISTANCE[i], space, scheduler);
                space.updateAgent(b, sun_x + DISTANCE[i], sun_y); 
                scheduler.scheduleRepeatingIn(b, 1);
            }
        }
       
        reset();
       
        while (scheduler.current_time < 2) {
           scheduler.update();
        }

   }) ;
});