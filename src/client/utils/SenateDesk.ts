


export enum PartyColor {
    dem = "#6774F8",
    rep = "#F16868",
    ind = "#B968F1",

    yeah = "#0D934C",
    nay = "#FFCC00",
    abstain = "#fff"
}

export class Desk {

    private innerPadding: number;

    public party: string;
    public state: string;
    public x: number;
    public y: number;
    public r: number;
    public lis: string;
    public bioguide: string;
    public meta: any;
    public a: number;
    public voteStatus: "Yea" | "Nay" | "Abstain" | "Absent" | "";
    
    private color: PartyColor;

    constructor(public name, public deskNumber, private row, a = null){
        this.name = name;
        this.a = this.a * (Math.PI/180) ;
        this.innerPadding = this.row * 70 + 80;
        
        this.r = (10 * (4 + Math.pow(this.row, 1.4)) / 5) - 3;

        this.angle(a || 0);
        
        this.lis;
        this.bioguide;
        this.meta = null;

        this.voteStatus = "";
      }

    angle(a){
        if(a !== undefined){
            this.a = a * (Math.PI/180);
            this.x = this.innerPadding * Math.cos(this.a - Math.PI / 2);
            this.y = this.innerPadding * Math.sin(this.a - Math.PI / 2);
        }else{
            return this.a;
        }
    }

    stroke(){
        return this.party == 'Democrat' ? PartyColor.dem : this.party == "Republican" ? PartyColor.rep : PartyColor.ind;
    }

    fill(color?: PartyColor) {
        if(color != undefined){
            this.color = color;
        }else{
            if(this.color != undefined){
                return this.color;
            }
            return this.party == 'Democrat' ? PartyColor.dem : this.party == "Republican" ? PartyColor.rep : PartyColor.ind;
        }
    }
}