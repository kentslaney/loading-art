var loader={
	loaders: [
		(function(canvas, context){
			var distance=2,offset={x:canvas.width/2,y:canvas.height/2},radius=Math.min(offset.x,offset.y)*.9,rings=radius/distance,
				draw=(function(deltaangle){
						canvas.height=canvas.height
						context.moveTo(offset.x,offset.y)
						context.lineTo(offset.x+distance,offset.y)
						for(var x,y=0,z=0,i=1; i<rings; i++){
							x=deltaangle+y
							y=Math.asin(i/(i+1)*Math.sin(Math.PI-x))
							z+=x-y
							context.lineTo(Math.cos(z)*(i+1)*distance+offset.x,
							               Math.sin(z)*(i+1)*distance+offset.y)
						}
						context.strokeStyle="rgb(102,102,102)"
						context.stroke()
					}),
				ddangle=.1*Math.PI/180, dtime=15,
				cdangle=-ddangle
			return window.setInterval((function(){draw(cdangle+=ddangle)}),dtime)
		}),
		(function(canvas, context){
			var projection=this.util.d3.orthographic(context,{x:canvas.width/2,y:canvas.height/2},
					this.util.d3.cube.obj,this.util.d3.cube.connections),
				rotation=(function(a,b,c){return [a.rotate(b,c.y),a.rotate(b,c.x),a.rotate(b,c.z)]})
					(this.util.d3,this.util.d3.rotationstring([this.util.d3.vector.y,45],[[1,0,1],Math.atan(Math.SQRT1_2)*180/Math.PI]),this.util.d3.vector),
				drawscale=Math.min(canvas.width,canvas.height)*.95*.3, dtime=15, timing={offset:.5,delay:.05,spsr:1.5,rotating:[[]]},
				t=-dtime/1000,depth=40,transition=this.util.transition.easeinout, currentrotation=0, angle
			timing.total=timing.offset+depth*timing.delay+timing.spsr
			for(var i=0; i<depth; i++){
				(function(start){
					var end=start+timing.spsr
					timing.rotating.push((function(t){return (t>start&&t<end)?(t-start)/timing.spsr:0}))
				})(timing.offset+i*timing.delay)
			}
			return window.setInterval((function(){
					canvas.height=canvas.height
					t+=dtime/1000
					if(t>timing.total){
						t=t%timing.total
						currentrotation=(currentrotation+1)%rotation.length
					}
					for(var i=1; i<=depth; i++){
						projection(drawscale*i/depth,rotation[currentrotation](transition(timing.rotating[i](t))*180))
					}
					context.strokeStyle="rgb(102,102,102)"
					context.stroke()
				}),dtime)
		}),
		(function(canvas, context){
			var drawscale=Math.min(100,canvas.height*.8/2,canvas.width*.8/3), d3=this.util.d3, dtime=15, t=-dtime/1000,depth=20,
				projection=d3.orthographic(context,{x:canvas.width/2,y:canvas.height/2},d3.cube.obj,d3.cube.connections),
				draw=(function(depth,roty,rotz){
						var scaler=Math.SQRT1_2/Math.cos((45-rotz)*Math.PI/180), scale=drawscale, zangle=0,
							rotation=d3.rotationmatrix(d3.vector.y,roty)
						for(var i=depth; i>0; i-- && (scale*=scaler) && (zangle+=rotz)){
							projection(scale,d3.matrixmultiply(rotation,d3.rotationmatrix(d3.vector.z,zangle)))
						}
						context.strokeStyle="rgb(102,102,102)"
						context.stroke()
					}),
				timing={times:[.5,1,.2,1],timing:(function(t){
						for(var i=0,j=0; t>j; (j+=this.times[i++])){}i--
						return {g:i,t:1+(t-j)/this.times[i]}
					}),total:(function(){
						for(var i=this.times.length-1,t=0; i>=0; i--){t+=this.times[i]}
						return t
					})},easeout=this.util.transition.easeout
			timing.total=timing.total()
			return window.setInterval((function(){
					canvas.height=canvas.height
					t=(t+dtime/1000)%timing.total
					sub=timing.timing(t)
					switch(sub.g){
						case 0: draw(1,0,0); break
						case 1: draw(depth,0,sub.t*45); break
						case 2: draw(depth,0,45); break
						case 3: sub.t=easeout(sub.t);draw(depth,sub.t*90,(1+sub.t)*45); break
					}
				}),dtime)
		}),
		(function(canvas,context){
			var offset={x:canvas.width/2,y:canvas.height/2},
				drawscale=Math.min(canvas.width,canvas.height)*.95/2, resolution=.1, util=this.util, dtime=15, t=-dtime/1000,
				draw=(function(t,xr,yr,xs,ys,cs,xl,yl){
					// time, x radius, y radius, x speed, y speed, center speed, x length, y length
					var s=2*Math.PI/cs
					t=t%(2*s)
					if(!complete){
						for(var point; i<=t; i+=resolution){
							point=util.d2.circleintersection(
								1+(1-Math.cos(i*xs))*xr,Math.sin(i*xs)*xr,xl,
								Math.cos(i*ys)*yr,1+(1-Math.sin(i*ys))*yr,yl)
							point=point[Math.round(.5+.5*Math.sign(
								 Math.pow(point[0].x,2)+Math.pow(point[0].y,2)-
								(Math.pow(point[1].x,2)+Math.pow(point[1].y,2))))]
							point=util.d2.scale(util.d2.rotate(point,i*cs),drawscale)
							points.push(point)
						}
						if(t>=s){
							complete=true
							i=s
						}
					}else{
						points=points.slice((t-i)/resolution)
						i=t-((t-i)%resolution)
						if(t<s){
							points=[]
							complete=false
							i=0
						}
					}
					var cosangle=Math.cos(-t*cs), sinangle=Math.sin(-t*cs), first=true
					for(var j=points.length-1; j>=0; j--){
						var point=util.d2.translate(util.d2.rotate(points[j],sinangle,cosangle),offset)
						if(first){ context.moveTo(point.x,point.y); first=false }
						else context.lineTo(point.x,point.y)
					}
					context.strokeStyle="rgb(102,102,102)"
					context.stroke()
				}), i=0, points=[], complete=false,
				settings={xr:.25,yr:.25,xs:util.rad(21),ys:util.rad(7),cs:util.rad(.1),xl:1.2,yl:1.2}
			return window.setInterval((function(){
				canvas.height=canvas.height
				draw(t+=dtime/4,settings.xr,settings.yr,settings.xs,settings.ys,settings.cs,settings.xl,settings.yl)
			}),dtime)
		}),
		(function(canvas, context){
			var ndots=30, radius=3, spacing=10, amplitude=30, offsety=canvas.height/2, offsetx=[], tau=2*Math.PI
			for(var i=ndots, j=canvas.width/2-(ndots-1)*(radius+spacing/2); i>0; (i--)&&(j+=2*radius+spacing)){ offsetx.push(j) }
			var dtime=15, t=-dtime/1000, period=1, increase=1
			period*=tau
			increase/=ndots
			return window.setInterval((function(){
				canvas.height=canvas.height
				t+=dtime/1000
				context.strokeStyle="rgb(102,102,102)"
				for(var i=ndots-1; i>=0; i--){
					context.beginPath()
					context.arc(offsetx[i],offsety+Math.sin(t*period*(i*increase+1))*amplitude,radius,0,tau)
					context.stroke()
				}
			}),dtime)
		}),
		(function(canvas, context){
			var projection=this.util.d3.orthographic(context,{x:canvas.width/2,y:canvas.height/2}, this.util.d3.cube.obj,this.util.d3.cube.without([1,-1,-1])),
				anglecorrection=(function(rotation){return (function(angle){return rotation((angle<0?-1:1)*((Math.abs(angle)+45)%90-45))})}),
				urotation=anglecorrection(this.util.d3.rotate(this.util.d3.rotationstring([this.util.d3.vector.z,0],[this.util.d3.vector.y,45],[[1,0,1],Math.atan(Math.SQRT1_2)*180/Math.PI]),this.util.d3.vector.y)),
				drotation=anglecorrection(this.util.d3.rotate(this.util.d3.rotationstring([this.util.d3.vector.z,180],[this.util.d3.vector.y,45],[[1,0,1],Math.atan(Math.SQRT1_2)*180/Math.PI]),this.util.d3.vector.y)),
				squareprojection=this.util.d3.orthographic(context,{x:canvas.width/2,y:canvas.height/2},this.util.d3.square.obj,this.util.d3.square.connections),
				varclosure=(function(a){return (function(){ return a })}),
				topsquare  =varclosure(this.util.d3.rotationstring([this.util.d3.vector.z,45],[[-1,1,0],Math.atan(Math.SQRT2)*180/Math.PI])),
				leftsquare =varclosure(this.util.d3.rotationstring([this.util.d3.vector.y,45],[[1,0,1],Math.atan(Math.SQRT1_2)*180/Math.PI])),
				rightsquare=varclosure(this.util.d3.rotationstring([this.util.d3.vector.y,-45],[[1,0,-1],Math.atan(Math.SQRT1_2)*180/Math.PI])),
				transforms=[[
						[projection,urotation,[
							[0,Math.sqrt(6)*2/3,0],
							[2*Math.SQRT2,Math.sqrt(6)*2/3,0],
							[-2*Math.SQRT2,Math.sqrt(6)*2/3,0],
							[-Math.SQRT2,-Math.sqrt(2/3),0],
							[Math.SQRT2,-Math.sqrt(2/3),0],
							[0,-Math.sqrt(6)*4/3,0]
						]],
						[squareprojection,topsquare,[
							[-Math.SQRT2,Math.sqrt(6)*4/3,0],
							[Math.SQRT2,Math.sqrt(6)*4/3,0]
						]],
						[squareprojection,rightsquare,[
							[-5/2*Math.SQRT2,-Math.sqrt(1/6),0],
							[-3/2*Math.SQRT2,-7/6*Math.sqrt(6),0]
						]],
						[squareprojection,leftsquare,[
							[5/2*Math.SQRT2,-Math.sqrt(1/6),0],
							[3/2*Math.SQRT2,-7/6*Math.sqrt(6),0]
						]]
					], [
						[projection,drotation,[
							[0,0,0],
							[2*Math.SQRT2,0,0],
							[-2*Math.SQRT2,0,0],
							[-Math.SQRT2,-Math.sqrt(6),0],
							[Math.SQRT2,-Math.sqrt(6),0],
							[-Math.SQRT2,Math.sqrt(6),0],
							[Math.SQRT2,Math.sqrt(6),0]
						]],
						[squareprojection,topsquare,[
							[0,-Math.sqrt(6)*5/3,0]
						]],
						[squareprojection,rightsquare,[
							[5/2*Math.SQRT2,5*Math.sqrt(1/6),0]
						]],
						[squareprojection,leftsquare,[
							[-5/2*Math.SQRT2,5*Math.sqrt(1/6),0]
						]]
					]]
			for(var i=transforms.length-1; i>=0; i--){
				for(var j=transforms[i].length-1, cur; j>=0; j--){
					cur=transforms[i][j][2]
					for(var k=cur.length-1; k>=0; k--){
						cur[k]=this.util.d3.translationmatrix(cur[k][0],cur[k][1],cur[k][2])
					}
				}
			}
			var dtime=15, t=-dtime/1000, drawscale=250
			drawscale/=Math.sqrt(6)*11/3
			return window.setInterval((function(){
				canvas.height=canvas.height
				t+=dtime/1000
				var transform=Math.floor(t)%2, angle=t*90*(transform*2-1)
				for(var i=transforms[transform].length-1, cur; i>=0; i--){
					cur=transforms[transform][i][2]
					for(var j=cur.length-1; j>=0; j--){
						transforms[transform][i][0](drawscale,transforms[transform][i][1](angle),cur[j])
					}
				}
				context.strokeStyle="rgb(102,102,102)"
				context.stroke()
			}),dtime)
		}),
		(function(canvas,context){
			var projection=this.util.d3.orthographic(context,{x:canvas.width/2,y:canvas.height/2}, this.util.d3.cube.obj,this.util.d3.cube.without([1,1,-1])),
				rotation=(function(negativerotation,positiverotation){return (function(angle){
						if((angle=((angle+90)%180)-90)<0) return negativerotation(angle%90)
						else return positiverotation(-(angle%90))
					})})
					(this.util.d3.rotate(this.util.d3.rotationstring([this.util.d3.vector.z,  0],[this.util.d3.vector.y,45]),[1,0,1]),
					 this.util.d3.rotate(this.util.d3.rotationstring([this.util.d3.vector.z,180],[this.util.d3.vector.y,45]),[1,0,1])),
				angle=Math.atan(Math.SQRT1_2)*180/Math.PI,
				squareprojection=this.util.d3.orthographic(context,{x:canvas.width/2,y:canvas.height/2},
					(function(d,a,b,c){ for(var i=a.length-1,j=[]; i>=0; i--){ j.push(d.transform(b,c,a[i])) } return j })
						(this.util.d3,this.util.d3.square.obj,this.util.d3.translationmatrix(1,0,0),this.util.d3.identity),
					this.util.d3.square.connections),
				squares=
					[ [this.util.d3.rotate(this.util.d3.rotationstring([this.util.d3.vector.z,45],[[-1,1,0],Math.atan(Math.SQRT2)*180/Math.PI]),[0,1,0]),
						this.util.d3.translationmatrix(-Math.SQRT1_2,-Math.sqrt(3/2),0)
					],[this.util.d3.rotate(this.util.d3.rotationstring([this.util.d3.vector.y,45],[[1,0,1],Math.atan(Math.SQRT1_2)*180/Math.PI],[this.util.d3.vector.z,-90]),[0,1,0]),
						this.util.d3.translationmatrix(-Math.SQRT1_2,Math.sqrt(3/2),0)
					],[this.util.d3.rotate(this.util.d3.rotationstring([this.util.d3.vector.y,135],[[-1,0,1],Math.atan(Math.SQRT1_2)*180/Math.PI]),[0,-1,0]),
						this.util.d3.translationmatrix(Math.SQRT2,0,0)] ]
			var dtime=15, t=-dtime/1000, drawscale=200, speed=90
			drawscale/=4
			return window.setInterval((function(){
				canvas.height=canvas.height
				t+=dtime/1000
				if((t=t%((270+2*angle)/speed))<2*angle/speed){
					projection(drawscale,rotation(-angle+speed*t))
				}else{
					for(var i=squares.length-1; i>=0; i--){
						squareprojection(drawscale,squares[i][0](speed*(t-2*angle/speed)),squares[i][1])
					}
				}
				context.strokeStyle="rgb(102,102,102)"
				context.stroke()
			}),dtime)
		}),
		(function(canvas, context){
			return this.util.displayPath(canvas, context, 20,
				this.util.lsystem(60, "A", {"A": "A-B--B+A++AA+B-","B": "+A-BB--B-A++A+B"}, "", 4), 10, 1)
		}),
		(function(canvas, context){
			return this.util.displayPath(canvas, context, 20,
				this.util.lsystem(120, "F-G-G", {"F": "F-G+F+G-F","G": "GG"}, "", 6), 10, 2)
		}),
		(function(canvas, context){
			return this.util.displayPath(canvas, context, 20,
				this.util.lsystem(72, "F-F-F-F-F", {"F": "F-F++F+F-F-F"}, "", 4), 10, 1)
		}),
		(function(canvas, context){
			var rand=this.util.random.walk([[8, 30], [.08, .5], [10,180,.005]], 0.97), distance=0.01, dtime=30,
				padding=35, maxdistance=Math.min(canvas.width/2-padding, canvas.height/2-padding),
				offset={x:canvas.width/2,y:canvas.height/2},
				draw=(function(size, spread, dangle){
					dangle=dangle*Math.PI/180
					context.strokeStyle="rgb(102,102,102)"
					for(i=0, angle=0; i<maxdistance; (i+=spread)&&(angle+=dangle)){
						context.beginPath()
						context.arc(offset.x+Math.cos(angle)*i,offset.y+Math.sin(angle)*i,size,0,Math.PI*2)
						context.closePath()
						context.stroke()
					}
				})
			return window.setInterval((function(){
				canvas.height=canvas.height
				draw.apply(this,rand(distance))
			}),dtime)
		})
	],
	initializer: (function(){
			this.loaders.util=this.util
		}),
	load:(function(canvas, number){
			if(number<0||number>=this.loaders.length) throw('out of range')
			return {
				interval: this.loaders[number](canvas, canvas.getContext('2d')),
				stop:(function(){
					window.clearInterval(this.interval)
				})
			}
		}),
	loadrandom:(function(canvas){
			return this.load(canvas, Math.floor(Math.random()*this.loaders.length))
		}),
	util: {
		matrixmultiply: (function(matrix1,matrix2){
				var result=[]
				if(arguments.length>2){
					result=arguments[0]
					for(var i=1; i<arguments.length; i++){
						result=this.matrixmultiply(result,arguments[i])
					}
					return result
				}
				for(var i=0;i<matrix1.length;i++){
					result[result.length]=[]
				}
				for(var j=0;j<matrix2[0].length;j++){
					for(var i=0;i<matrix1.length;i++){
						var sum=0
						for(var k=0;k<matrix2.length;k++){
							sum+=matrix1[i][k]*matrix2[k][j]
						}
						result[i][j]=sum
					}
				}
				return result
			}),
		d3: {
			rotationmatrix: (function(vector,angle){
					vector=this.unitize(vector)
					angle*=Math.PI/180
					var c=Math.cos(angle), s=Math.sin(angle), t=1-c
					return [[t*Math.pow(vector[0],2)+c,t*vector[0]*vector[1]-s*vector[2],t*vector[0]*vector[2]+s*vector[1],0],
					        [t*vector[0]*vector[1]+s*vector[2],t*Math.pow(vector[1],2)+c,t*vector[1]*vector[2]-s*vector[0],0],
					        [t*vector[0]*vector[2]-s*vector[1],t*vector[1]*vector[2]+s*vector[0],t*Math.pow(vector[2],2)+c,0],
					        [0,0,0,1]]
				}),
			translationmatrix: (function(x,y,z){
					return [[1,0,0,x],
					        [0,1,0,y],
					        [0,0,1,z],
					        [0,0,0,1]]
				}),
			unitize: (function(vector){
					var length=Math.sqrt(Math.pow(vector[0],2)+Math.pow(vector[1],2)+Math.pow(vector[2],2))
					return [vector[0]/length,vector[1]/length,vector[2]/length]
				}),
			vector: {
				x: [1,0,0],
				y: [0,1,0],
				z: [0,0,1]
			},
			identity: [[1,0,0,0],
			           [0,1,0,0],
			           [0,0,1,0],
			           [0,0,0,1]],
			rotationstring: (function(){
					var result=this.identity
					for(var i=0; i<arguments.length; i++){
						result=this.matrixmultiply(result,this.rotationmatrix(arguments[i][0],arguments[i][1]))
					}
					return result
				}),
			transform: (function(translation, rotation, point){
					if(!point){ point=rotation; rotation=translation; translation=this.identity }
					var result=this.matrixmultiply(translation,rotation,[[point[0]],[point[1]],[point[2]],[1]])
					return [result[0][0]/result[3][0],result[1][0]/result[3][0],result[2][0]/result[3][0]]
				}),
			cube: {
				obj: [],
				connections: [],
				initializer: (function(){
					for(var i=7; i>=0; i--){
						var point=[i>>2?1:-1,i%4>>1?1:-1,i%2?1:-1]
						this.obj.push(point)
						for(var j=0; j<3; j++)
							if(point[j]>0)
								this.connections.push([this.obj.length-1,this.obj.length-1+Math.pow(2,2-j)])
					}
				}),
				without: (function(point){
					return (function(a,b){for(var i=a.length-1, j=[]; i>=0; i--){if(a[i].indexOf(b)==-1){j.push(a[i])}}return j})
						(this.connections, (function(a,b){for(var i=a.length-1; i>=0; i--){for(var j=2; j>=0; j--){if(a[i][j]!=b[j]){break}}if(j<0){return i}}})(this.obj,point))
				})
			},
			square: {
				obj: [[1,1,0],[-1,1,0],[-1,-1,0],[1,-1,0]],
				connections: [[0,1],[1,2],[2,3],[3,0]]
			},
			orthographic: (function(context, offset, obj, connected){
					var self=this
					return (function(scaler, rotation, translation){
						var points=[]
						for(var i=obj.length-1; i>=0; i--){
							var transformed=self.transform(translation||self.identity,rotation,obj[i])
							points.push([transformed[0]*scaler,transformed[1]*scaler])
						}
						for(var i=connected.length-1; i>=0; i--){
							context.moveTo(offset.x+points[connected[i][0]][0],offset.y+points[connected[i][0]][1])
							context.lineTo(offset.x+points[connected[i][1]][0],offset.y+points[connected[i][1]][1])
						}
					})
				}),
			rotate: (function(start, vector){
					var self=this
					return (function(angle){
							return self.matrixmultiply(start,self.rotationmatrix(vector,angle))
						})
				})
		},
		initializer: (function(){
				this.d2.parent=this.transition.parent=this
				this.d3.matrixmultiply=this.matrixmultiply
			}),
		transition: {
			bezier: (function(p0,p1,p2,p3,dt){
					if(!p2){p2=p1; p1=p0; p0=[0,0]; p3=[1,1]}
					var cX=3*(p1[0]-p0[0]), bX=3*(p2[0]-p1[0])-cX, aX=p3[0]-p0[0]-cX-bX
					var cY=3*(p1[1]-p0[1]), bY=3*(p2[1]-p1[1])-cY, aY=p3[1]-p0[1]-cY-bY
					if(dt){
						return (function(t){
								return [aX*Math.pow(t,3)+bX*Math.pow(t,2)+cX*t+p0[0],
								        aY*Math.pow(t,3)+bY*Math.pow(t,2)+cY*t+p0[1]]
							})
					}else{
						var cubicroots=this.parent.cubicroots
						return (function(x){
							var t=cubicroots(aX,bX,cX,p0[0]-x)
							for(var i=t.length-1; i>=0; i--)
								if(t[i]>=0&&t[i]<=1){ t=t[i]; break }
							return aY*Math.pow(t,3)+bY*Math.pow(t,2)+cY*t+p0[1]
						})
					}
				}),
			ease: (function(){return this.bezier([0.25,0.1],[0.25,1])}),
			linear: (function(x){return x}),
			easein: (function(){return this.bezier([0.42,0],[1,1])}),
			easeout: (function(){return this.bezier([0,0],[0.58,1])}),
			easeinout: (function(){return this.bezier([0.42,0],[0.58,1])}),
			initializer: ['ease','easein','easeout','easeinout']
		},
		cubicroots: (function(a,b,c,d){
				if(a){
					var p=(3*a*c-b*b)/(3*a*a),q=(2*b*b*b-9*a*b*c+27*a*a*d)/(27*a*a*a)
					if(!p){
						return [-Math.sign(q)*Math.pow(Math.abs(q),1/3)-b/3/a]
					}else if(4*p*p*p+27*q*q<=0){
						var r=Math.acos(3*q/2/p*Math.sqrt(-3/p))/3,s=2*Math.sqrt(-p/3),t=2*Math.PI/3,
							u=(function(k){return s*Math.cos(r-t*k)-b/3/a})
						return [u(0),u(1),u(2)]
					}else if(p<0){
						return [-2*Math.sign(q)*Math.sqrt(-p/3)*Math.cosh(Math.acosh(-3*Math.abs(q)/2/p*Math.sqrt(-3/p))/3)-b/3/a]
					}else{
						return [-2*Math.sqrt(p/3)*Math.sinh(Math.asinh(3*q/2/p*Math.sqrt(3/p))/3)-b/3/a]
					}
				}else if(b){
					var r=Math.sqrt(c*c-4*b*d)
					if(r===0) return [(-c+r)/2/b]
					else if(!r) return []
					else return [(-c+r)/2/b, (-c-r)/2/b]
				}else if(c){
					return [-d/c]
				}
				return []
			}),
		rad: (function(deg){ return deg*Math.PI/180 }),
		d2: {
			circleintersection: (function(x1,y1,r1,x2,y2,r2){
					var m=-(x1-x2)/(y1-y2), b=((x1*x1-x2*x2)+(y1*y1-y2*y2)-(r1*r1-r2*r2))/2/(y1-y2),res=[]
						xs=this.parent.cubicroots(0,m*m+1,2*(b-y1)*m-2*x1,x1*x1+Math.pow(b-y1,2)-r1*r1)
					for(var i=0;i<xs.length;i++){ res.push({x:xs[i],y:xs[i]*m+b}) }
					return res
				}),
			rotate: (function(point, theta, cosangle){
					if(cosangle===undefined) var s=Math.sin(theta), c=Math.cos(theta)
					else var s=theta, c=cosangle
					return {x: point.x*c-point.y*s, y: point.x*s+point.y*c}
				}),
			scale: (function(point,scaler){
					return {x: point.x*scaler, y: point.y*scaler}
				}),
			translate: (function(point,vector){
					return {x: point.x+vector.x, y: point.y+vector.y}
				})
		},
		cache: (function(){
				var cached={}
				this.set = (function(res){
					return cached[JSON.stringify(Array.prototype.slice.call(arguments,1))]=res
				})
				this.get = (function(){
					return cached[JSON.stringify(Array.prototype.slice.call(arguments))]
				})
				this.contains = (function(){
					return JSON.stringify(Array.prototype.slice.call(arguments)) in cached
				})
			}),
		lsystem: (function(angle, initial, rules, ignore, n){
				angle=this.rad(angle)
				matrixmultiply=this.matrixmultiply
				var cache=new this.cache(), cosangle=Math.cos(angle), sinangle=Math.sin(angle),
					left=[[cosangle, -sinangle],[sinangle, cosangle]], right=[[cosangle, sinangle],[-sinangle, cosangle]],
					execute=(function(cmds, n){
							var dir=[[1, 0], [0, 1]], points=[[0],[0]], npoints
							for(var i=0, cmd; i<cmds.length; i++){
								cmd=cmds[i]
								if(cmd=="+") dir=matrixmultiply(right, dir)
								else if(cmd=="-") dir=matrixmultiply(left, dir)
								else{
									if(n==0){
										if(ignore.indexOf(cmd)==-1){
											npoints=matrixmultiply(dir, [[0,1],[0,0]])
										}else{
											continue
										}
									}else{
										npoints=cache.contains(cmd,n)?cache.get(cmd, n):cache.set(execute(rules[cmd],n-1), cmd, n)
										npoints=matrixmultiply([dir,dir=matrixmultiply(npoints[1], dir)][0], npoints[0])
									}
									for(var lpoint=[points[0][points[0].length-1], points[1][points[1].length-1]],
										j=npoints[0].length-1; j>=0; j--){
										npoints[0][j]+=lpoint[0]
										npoints[1][j]+=lpoint[1]
									}
									points=[points[0].concat(npoints[0].slice(1)), points[1].concat(npoints[1].slice(1))]
								}
							}
							return [points, dir]
						})
				return execute(initial, n)[0]
			}),
		displayPath: (function(canvas, context, padding, path, t, n){
			var bounds=[[Math.min.apply(Math, path[0]), Math.max.apply(Math, path[0])],
				[Math.min.apply(Math, path[1]), Math.max.apply(Math, path[1])]],
				scaler=Math.min((canvas.width-2*padding)/(bounds[0][1]-bounds[0][0]),
					(canvas.height-2*padding)/(bounds[1][1]-bounds[1][0])),
				constant=[canvas.width/2-(bounds[0][0]+bounds[0][1])*scaler/2, canvas.height/2-(bounds[1][0]+bounds[1][1])*scaler/2]
				point=(function(i){ return [path[0][i]*scaler+constant[0], path[1][i]*scaler+constant[1]] }),
				min=0, max=1, maxincreasing=true, end=path[0].length-1
			n=n||1
			return window.setInterval((function(){
				canvas.height=canvas.height
				if(maxincreasing){ max=Math.min(max+n, end) }else{ min=Math.min(min+n, end) }
				context.moveTo.apply(context, point(min))
				for(var i=min+1; i<=max; i++){
					context.lineTo.apply(context, point(i))
				}
				if(maxincreasing){
					if(max==end) maxincreasing=false
				}else{
					if(min==end){
						min=0
						max=1
						maxincreasing=true
					}
				}
				context.strokeStyle="rgb(102,102,102)"
				context.stroke()
			}), t)
		}),
		random: {
			range: (function (min, max){ return Math.random()*(max-min)+min }),
			direction: (function(dimensions, distance){
				if(dimensions==1) return Math.random>0.5?1:-1
				for(var res=[], prev=distance||1, i=dimensions-2, angle; i>=0; i--){
					angle=Math.random()*Math.PI*(i?1:2)
					res.push(prev*Math.cos(angle))
					prev*=Math.sin(angle)
				}
				return res.concat([prev])
			}),
			bound: (function(position, direction, k){
				if(position<=0) return 1
				else if(position>=1) return -1
				else if(position<0.5){
					position=1-position
					var flip=-1
				}else{
					var flip=1
				}
				return (2*Math.pow((flip*direction+1)/2, Math.pow(1/(1-position)-1, k))-1)*flip
			}),
			walk: (function(bounds, momentum, values){
				var k=0.4, velocity=[]
				for(var i=bounds.length-1; i>=0; i--){
					velocity.push(0)
					if(!bounds[i][2]) bounds[i][2]=1
				}
				momentum=momentum||0
				if(!values||values.length!=bounds.length){
					values=[]
					for(var i=bounds.length-1; i>=0; i--){
						values.unshift(this.range(bounds[i][0], bounds[i][1]))
					}
				}
				var self=this, velocitylength=1
				return (function(distance){
						var dir=self.direction(bounds.length)
						for(var sum=0, bounded, i=values.length-1; i>=0; i--){
							bounded=self.bound((values[i]-bounds[i][0])/(bounds[i][1]-bounds[i][0]), dir[i], k)
							velocity[i]=velocity[i]*momentum/velocitylength+(1-momentum)*bounded
							sum+=Math.pow(velocity[i],2)
							values[i]+=distance*(bounds[i][1]-bounds[i][0])*bounds[i][2]*velocity[i]
						}
						velocitylength=Math.sqrt(sum)
						return values
					})
			})
		}
	},
	initialize: (function(obj,stack,initf){
			obj=obj||this
			stack=stack||[obj]
			initf=initf||this.initialize
			for(var i in obj){
				if(i=="initializer"){
					if(Object.prototype.toString.call(obj[i])=="[object Array]"){
						for(var j=obj[i].length-1; j>=0; j--){
							obj[obj[i][j]]=obj[obj[i][j]]()
						}
					}else if(obj[i].constructor==Function){
						obj[i]()
					}
				}else if(typeof(obj[i])=="object"&&!stack.some(function(e){return e==obj[i]})){
					initf(obj[i],stack.concat([obj[i]]),initf)
				}
			}
			return this
		})
}.initialize()
