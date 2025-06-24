import { sendMessageToContacts } from "@/lib/wsp";
import { loadContacts } from "./storage";

// const groupId = "120363418643487096@g.us"; // founders - reganvi
// const groupId = "120363195877975691@g.us"; // main - reganvi
// const groupId = "120363162435047981@g.us"; // internal - reganvi
// const groupId = "120363274638084601@g.us"; // grouty

// const contacts = await getGroupContacts({
// 	localAuth: true,
// 	groupId,
// 	stayAlive: false,
// });
//
// await saveContacts(contacts);

const contacts = await loadContacts();

const message =
	"Estimado miembro del grupo de Reganvi,\n\n Queremos informarle que, a partir de la fecha, el señor Víctor Palma ya no forma parte de la empresa Reganvi. Agradecemos su valioso aporte durante su tiempo con nosotros, especialmente en la gestión de ventas y compras, que contribuyó al fortalecimiento de nuestros procesos.\n\n Con el objetivo de optimizar nuestra comunicación y fortalecer la coordinación entre todos, hemos creado un nuevo espacio para el equipo de comercialización.\n\n Les invitamos a unirse a nuestra comunidad de anuncios a través del siguiente enlace:\n 👉 https://chat.whatsapp.com/LVnxRHGU1Cg8lgypxMRVeh\n\n En esta, continuaremos trabajando con el compromiso de siempre, promoviendo la economía circular y asegurando un entorno colaborativo y profesional para todos.\n\n Agradecemos su comprensión y apoyo en esta nueva etapa.\n\n Equipo Reganvi";

await sendMessageToContacts({
	contacts,
	exclude: ["51925531984", "51994898110"],
	localAuth: true,
	messages: [message],
	stayAlive: false,
});
