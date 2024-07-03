let g = [0,0]
const C = 0.8
const inconsequentialVelocity = 0.0001
const metre = 100
const duration = 2000
const gs = [[0.1,0],[0,0.1],[-0.1,0],[0,-0.1]]
let place = 0

function tfromuas(u,a,s){
    if (a !== 0) {
        return (-u + Math.sqrt(u ** 2 + 2 * a * s)) / a
    } else{
        return s/u
    }
}

class ball{
    constructor(ID,mass,radius,x,y) {
        this.ID = ID
        this.mass = mass
        this.radius = radius
        this.position = [x,y]
        this.velocity = [0,0]

        this.updateRadius()
        this.updatePosition()
    }

    updateRadius(){
        this.ID.style.width = 2*metre*this.radius+"px"
        this.ID.style.height = 2*metre*this.radius+"px"
    }
    updatePosition(){
        this.ID.style.top = this.left(this.position[1])*metre+"px"
        this.ID.style.left = this.left(this.position[0])*metre+"px"
    }

    left(position){
        return position-this.radius
    }
    right(position){
        return position+this.radius
    }

    distanceLeft(left,position){
        return this.left(position)-left
    }
    distanceRight(right,position){
        return right-this.right(position)
    }

    // check after collisions with balls since you can hit a ball on the way to the box
    move(left,right,top,bottom,deltaTime){
        this.moveInDimension(0,left,right,deltaTime)
        this.moveInDimension(1,top,bottom,deltaTime)
        this.updatePosition()
    }

    moveInDimension(dimension,left,right,deltaTime){
        const nextPosition = this.position[dimension]+(this.velocity[dimension]+0.5*g[dimension]*deltaTime)*deltaTime
        if (this.left(nextPosition) < left){
            const t = tfromuas(-this.velocity[dimension],-g[dimension],this.distanceLeft(left,this.position[dimension]))
            this.position[dimension] = left+this.radius
            if (this.velocity[dimension] <= -inconsequentialVelocity){
                const v = this.velocity[dimension] + g[dimension]*t
                this.velocity[dimension] = -C * v
                this.moveInDimension(dimension,left,right,deltaTime-t)
            } else{
                this.velocity[dimension] = 0
            }
        } else if (this.right(nextPosition) > right){
            const t = tfromuas(this.velocity[dimension],g[dimension],this.distanceRight(right,this.position[dimension]))
            this.position[dimension] = right-this.radius
            if (this.velocity[dimension] >= inconsequentialVelocity){
                const v = this.velocity[dimension] + g[dimension]*t
                this.velocity[dimension] = -C * v
                this.moveInDimension(dimension,left,right,deltaTime-t)
            } else{
                this.velocity[dimension] = 0
            }
        } else{
            this.position[dimension] = nextPosition
            this.velocity[dimension] += g[dimension]*deltaTime
        }
    }
}

const box = document.getElementById("box").getBoundingClientRect()
const balls = [
    new ball(document.getElementById("ball1"),0.5,20/metre,400/metre,100/metre)
]

function collideBall(){
    for (let i = 0;i<balls.length;i++){
        for (let j = i+1;j<balls.length;j++){
            const ball1 = balls[i]
            const ball2 = balls[j]
            if (((ball1["x"]-ball2["x"])**2 +(ball1["y"]-ball2["y"])**2) <= ((ball1["radius"]+ball2["radius"])**2)){
                const midPointx = (ball1["x"]+ball2["x"])/2
                const midPointy = (ball1["y"]+ball2["y"])/2
                const directionMagnitude = ((ball1["x"]-ball2["x"])**2+(ball1["y"]-ball2["y"])**2)**0.5
                const directionx = (ball1["x"]-ball2["x"])/directionMagnitude
                const directiony = (ball1["y"]-ball2["y"])/directionMagnitude
                ball1["x"] = midPointx+directionx*1.01*ball1["radius"]
                ball1["y"] = midPointy+directiony*1.01*ball1["radius"]
                ball2["x"] = midPointx-directionx*1.01*ball2["radius"]
                ball2["y"] = midPointy-directiony*1.01*ball2["radius"]
                if ((ball1["x"]-ball2["x"])**2 +(ball1["y"]-ball2["y"])**2 <= (ball1["radius"]+ball2["radius"])**2){
                    console.log("NOT FIXED")
                }
                const Vx = (ball1["mass"]*ball1["vx"]+ball2["mass"]*ball2["vx"])/(ball1["mass"]+ball2["mass"])
                const Vy = (ball1["mass"]*ball1["vy"]+ball2["mass"]*ball2["vy"])/(ball1["mass"]+ball2["mass"])
                ball1["vx"] = C*(Vx-ball1["vx"])+Vx
                ball1["vy"] = C*(Vy-ball1["vy"])+Vy
                ball2["vx"] = C*(Vx-ball2["vx"])+Vx
                ball2["vy"] = C*(Vy-ball2["vy"])+Vy
            }
        }
    }
}

let time = performance.now()
let previousSwap = performance.now()

update()

function update(){
    if (performance.now()-previousSwap > duration){
        previousSwap = performance.now()
        place += 1
        g = gs[place%4]
    }

    const deltaTime = (performance.now()-time)/1000
    time = performance.now()

    for (let i = 0;i<balls.length;i++){
        balls[i].move(box.left/metre,box.right/metre,box.top/metre,box.bottom/metre,deltaTime)
    }

    requestAnimationFrame(update)
}
