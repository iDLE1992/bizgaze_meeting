

/**
 * **************************************************************************
 * 
 *              should match with /src/Server/Protocol/BGtoUser
 *              
 * **************************************************************************
 */
export enum BGtoUser {
    ROOM_CREATED        = "created",
    ROOM_INFO           = "room_info",
    ROOM_JOINED         = "joined",
    ROOM_USER_JOINED    = "user_joined",
    ROOM_LEFT           = "left",
    ERROR               = "error",
    SIGNALING           = "SignalingMessage",
};

/**
 * **************************************************************************
 * 
 *              should match with /src/Server/Protocol/UserToBG
 *              
 * **************************************************************************
 */
export enum UserToBG {

}

export enum UserToUserViaBG {

}
