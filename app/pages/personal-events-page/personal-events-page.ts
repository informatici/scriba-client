import {Component} from '@angular/core';
import {NavController, Modal, Alert} from 'ionic-angular';
import {EventService} from '../../services/event-services';
import {Events} from 'ionic-angular';

//IMPORT PAGES - MODALS
import {NewEventPage} from '../modals/event/event-modal';
import {EventPage} from '../event-page/event-page';

//import {Event} from '../../services/models/event-model'
//import {Session} from '../../services/models/session-model'
//import {Intervent} from '../../services/models/intervent-model'

@Component({
  templateUrl: 'build/pages/personal-events-page/personal-events-page.html',
  providers: [EventService]
})
export class PersonalEventsPage {
  private mobile=window.localStorage.getItem("platform");
	
  private events=[];

  constructor(private evts: Events, private nav: NavController, private es: EventService) {
    
  }
  
  ionViewWillEnter(){
	  this.updateEvents();
  }

  updateEvents(){//CAMBIARE IN GET PERSONAL EVENTS
    let _events = [];

    this.es.getPersonalEvents().map(res=> res.json()).subscribe((data) => {
      data.data.forEach(event =>{
        event.expanded=false;
        //FINDS AND MERGES SESSIONS
        let _sessions = [];
        this.es.getSessions(event._id).map(res=>res.json()).subscribe(data=>{
          data.data.forEach(session =>{
            session.expanded=false;
            //FINDS AND MERGES INTERVENTS
            let _intervents = [];
            this.es.getIntervents(session._id).map(res=>res.json()).subscribe(data=>{
              data.data.forEach(intervent =>{
                _intervents.push(intervent);
              session.intervents=_intervents;
              })
            });
            _sessions.push(session);
            event.sessions=_sessions;
          })
        })
        _events.push(event);

      });
      this.events = _events;
      console.log(this.events);
    });
  }
  newEvent(){
    this.evts.subscribe('reloadPersonalPage',() => {
      this.updateEvents();
    });
    let modal = Modal.create(NewEventPage);
    this.nav.present(modal);
  }
  openEvent(eventToOpen){
    this.nav.push(EventPage,{
        event: eventToOpen,
    });
  }
  deleteEvent(event){
    if(event.status=="ongoing"){
      alert("Impossibile eliminare l'Evento poichè è ancora IN CORSO!")
    }else{
      let confirm = Alert.create({
        title: 'Cancellare questo Evento?',
        message: 'Se cancelli questo Evento saranno eliminati tutte le sessioni e gli interventi al suo interno e non sarà più possibile ripristinarlo!',
        buttons: [
          {
            text: 'Cancella',
            handler: () => {
              console.log('Cancellalo');
              this.es.deleteEvent(event._id).map(res=>res.json()).subscribe(data=>{
                if (data.success) {
                  this.updateEvents();
                }else{
                  alert(data.msg)
                }
              });
            }
          },
          {
            text: 'Mantieni'
          }
        ]
      });
      this.nav.present(confirm);
    }
  }
  formatDate(date: string): string{
    let formattedDate = "";
    let dateObject = new Date(date);

    let day=dateObject.getDate();
    let month=dateObject.getMonth() + 1;
    let year=dateObject.getFullYear();
    let hours=dateObject.getUTCHours();
    let minutes=dateObject.getUTCMinutes();
    if(hours<10){
      formattedDate = day + "/" + month + "/" + year + " ORE: 0" + hours;
    }else{
      formattedDate = day + "/" + month + "/" + year + " ORE: " + hours;
    }
    if(minutes<10){
      formattedDate += ".0" + minutes;
    }else{
      formattedDate += "." + minutes;
    }
    return formattedDate;
  }
}