/* 
 * "LiteSlide"
 * Stripped-down slider - No animation here!  That's all controlled through CSS.  
 * This only switches the 'active' class. :)
 * Based on Zurb's Orbit
 */
 
(function($) {
	
    $.fn.liteslide = function(options) {
		var defaults = {
			timer: true,						// we can do this the easy way or the hard way...
			advanceSpeed: 5000, 				// time between transitions 
			children: 'img, a, div',			// default slide children - you can change to whatever
			advanceOnClick: false,				// advance on a slide click
			restartButton: false,				// generate a restart button?			
            pauseOnHover: false, 				// if you hover pauses the slider
            startClockOnMouseOut: false, 		// if clock should start on MouseOut
            startClockOnMouseOutAfter: 1000, 	// how long after MouseOut should the timer start again           
            dirNav: false, 						// manual advancing directional navs			
			bullets: false,						// true or false to activate the bullet navigation
			// custom classes for everything yayyyy!
			// bullets and directional nav get some default classes anyway so these are optional
			dirNavLCls: '',
			dirNavRCls: '',	
			bulletWrpCls: '',
			bulletCls: '',
			bulletActiveCls: 'active',
			activeCls: 'active',
			lastActiveCls: 'last-active',
			// do stuff after a slide switch
            afterSlideChange: function(){} 		// empty function 
     	};  
        
        //Extend those options
        var options = $.extend(defaults, options);
		
		return this.each(function() {
		
			var activeSlide = 0,
				numberSlides = 0,
				locked;
		
			var slides = $(this).children(options.children);
            slides.each(function() { 
				if(options.advanceOnClick) {
					$(this).click(function() {	
						stopClock(); 
						shift("next");  
					});
				}
                numberSlides++;
            });
			   
			//Animation locking functions
			function unlock() {
				locked = false;
			}
			function lock() { 
				locked = true;
			}
			//If there is only a single slide remove nav, timer and bullets
			if(slides.length == 1) {
				options.directionalNav = false;
				options.timer = false;
				options.bullets = false;
			}
			
			//Timer Execution
			function startClock() {
				if(!options.timer  || options.timer == 'false') { 
					return false;
				//if timer is hidden, don't need to do crazy calculations
				} else {
					clock = setInterval(function(e){
						shift("next");  
					}, options.advanceSpeed);  
					timerRunning = true;
				}
			}
			function stopClock() {
				if(!options.timer || options.timer == 'false') { return false; } else {
					timerRunning = false;
					clearInterval(clock);		            
				}
			} 
			if(options.timer) {  
				startClock();       
				if(options.startClockOnMouseOut){
					var outTimer;
					slideWrap.mouseleave(function() {
						outTimer = setTimeout(function() {
							if(!timerRunning){
								startClock();
							}
						}, options.startClockOnMouseOutAfter)
					})
					slideWrap.mouseenter(function() {
						clearTimeout(outTimer);
					})
				}				
			}  
			
			//Pause Timer on hover
			if(options.pauseOnHover) {
				slideWrap.mouseenter(function() {
					stopClock(); 
				});
			}
			
			
			if(options.restartButton) {
				var btn = document.createElement('button');
				$(btn).addClass('slide-restart-button');				
				$(btn).click(function() {		
					stopClock(); 
					shift(0);
					startClock(); 
				});
				$(this).append(btn);
			}
		
			//DirectionalNav { rightButton --> shift("next"), leftButton --> shift("prev");
            if(options.dirNav) {
            	if(options.directionalNav == "false") { return false; }
                var dirNav = '<span class="slide-nav slide-nav--dir slide-nav--right"><span class="hide">Right</span></span><span class="slide nav slide-nav--dir slide-nav--left"><span class="hide">Left</span></span>';
                $(this).append(dirNav);
                var leftBtn = $(this).children('.slide-nav--left'),
                	rightBtn = $(this).children('.slide-nav--right');                
				leftBtn.click(function() { 
                    stopClock();
                    shift("prev");
                });
                rightBtn.click(function() {
                    stopClock();
                    shift("next")
                });
				// add extra classes if specified
				$(leftBtn).addClass(options.dirNavLCls);
				$(rightBtn).addClass(options.dirNavRCls);
            }
		
			//Bullet Nav Setup
			if(options.bullets) { 
				var navOL=document.createElement('ol');
				$(navOL).addClass('slide-nav slide-nav--bullets');
				$(navOL).addClass(options.bulletWrpCls); 
				for(i=0; i<numberSlides; i++) {
					var newli = $('<li><span class="hide">'+(i+1)+'</span></li>');
					$(newli).addClass(options.bulletCls); 					
					$(navOL).append(newli);
					newli.data('index',i);
					newli.click(function() {						
						stopClock(); 
						shift($(this).data('index'));
					});
				}
				$(this).append(navOL);
				var bullets = $(this).children('.slide-nav--bullets');				
				setActiveBullet();
			}
			
			//Bullet Nav Execution
			function setActiveBullet() {
				if(!options.bullets) { return false; } else {
					bullets.children().removeClass(options.bulletActiveCls).eq(activeSlide).addClass(options.bulletActiveCls);
				}
			}
			
			//Change which slide is active
			function shift(direction) {
				//remember previous activeSlide
				var prevActiveSlide = activeSlide,
					slideDirection = direction;
				//exit function if bullet clicked is same as the current image
				if(prevActiveSlide == slideDirection) { return false; }
				//Unlock
				function resetAndUnlock() {
					slides
						.eq(prevActiveSlide);
					unlock();
					options.afterSlideChange.call(this);
				}
				if(slides.length == "1") { return false; }
				if(!locked) {
					lock();
					 //deduce the proper activeImage
					if(direction == "next") {
						activeSlide++
						if(activeSlide == numberSlides) {
							activeSlide = 0;
						}
					} else if(direction == "prev") {
						activeSlide--
						if(activeSlide < 0) {
							activeSlide = numberSlides-1;
						}
					} else {
						activeSlide = direction;
						if (prevActiveSlide < activeSlide) { 
							slideDirection = "next";
						} else if (prevActiveSlide > activeSlide) { 
							slideDirection = "prev"
						}
					}
					$('.'+options.lastActiveCls).removeClass(options.lastActiveCls);
					slides
						.eq(activeSlide)
						.addClass(options.activeCls);
					slides
						.eq(prevActiveSlide)
						.addClass(options.lastActiveCls)
						.removeClass(options.activeCls);					
						
					resetAndUnlock();
					//set to correct bullet
					setActiveBullet();  
				}
			}
		});//each call
	}//plugin call
})(jQuery);