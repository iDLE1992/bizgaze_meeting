/**
 * **************************************************************************
 *   
 *     Attention! - command param bool values are arrived as string 
 *               should convert to bool manually
 *   
 *     open or closed meeting?
 *     
 *          this.roomInfo.IsWebinar
 *              
 *     is joined to jitsiServer?
 *     
 *          this.jitsiRoomJoined()
 *              
 *     my jitsiId
 *     
 *          this.myInfo.Jitsi_Id
 *          this.jitsiRoom.myUserId()
 *     
 *     my name
 *     
 *          this.myInfo.Name
 *              
 *     am i host?         
 *              
 *              
 *     meeting title
 *           
 *           this.roomInfo.conferenceName
 *              
 *     meeting main host
 *           
 *           this.roomInfo.hostName
 *           
 *     get user from id
 *
 *          const user = this.jitsiRoom.getParticipantById(id) as JitsiParticipant;
 *          
 *     get id from user
 *              
 *          user.getId();
 *              
 *     user name          
 *              
 *          user.getDisplayName()
 *          
 *     get user id from track
 *     
 *          const id = track.getParticipantId();
 *          
 *     is user Host?          
 *
 *          const IsHost = user.getProperty(UserProperty.IsHost)
 *              
 *     get user tracks        
 *         
 *          user.getTracks()
 *          
 *     my message echo(come back)
 *     
 *          if (param.attributes.senderId === targetId)
 *              
 *     object copy         
 *              
 *          // using spread ... (shallow copy)
            let p1 = {
                ...person
            };

            // using  Object.assign() method (shallow copy)
            let p2 = Object.assign({}, person);
 *              
 *              
 *              
 *              
 *              
 *              
 *              
 *              
 *              
 *              
 *              
 *              
 *              
 *              
 * **************************************************************************
 */
