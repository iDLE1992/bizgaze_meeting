class Msg {   
    static Types = {
        "create": 1,
        "join": 2,
        "leave": 3,
        "roomlist": 4,
        "roomuserlist": 5,
        "chat": 6,
        "videomute": 7,
        "audiomute": 8,
        "screenshare": 9,
    };

    constructor() {       
        this.type = "";
        this.sourceId = "";
        this.destId = "";
        this.roomId = "";
        this.sourceName = "";
        this.destName = "";
    }
}