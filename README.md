# resasncf


Script Node.js permettant de vérifier l'ouverture des réservation sur un trajet SNCF.

ce script interroge le site voyage-sncf.com pour le trajet souhaité.


prévoir un lancement régulier (cron) et une alerte (mail, sms...) pour être prévenu de l'ouverture des ventes pour un voyage.


Utilise les packages 'request', 'underscore' et 'moment'



fichiers de setup  :

sncf_baserequest.json : fichier de conf principal, à conserver tel quel

sncf_config_1.json : fichier de configuration spécifique pour un voyage

détail du fichier sncf_config_1.json :
{
"conf":
{"transporters":["TGV","ICE"], 
// les transporteurs acceptés, utiliser ANY pour accepter tous les transporteurs (cf liste dans le fichier js)
"active":1}, // conf active
"sncf": // partie utilisée pour interroger le service sncf
{
"origin":"Strasbourg","destination":"Paris","departureDate":"2016-08-03T10:00:00"} // détails du trajet
}

Le script prend en compte plusieurs fichiers de conf si ils sont nommés de la manière suivante :
sncf_config_1.json
sncf_config_2.json
...

execution : 
node sncf.js

les notifications doivent être envoyées dans la méthode onPriceFound()
