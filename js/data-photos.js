/* ===================== 📷 ΔΙΟΡΘΩΣΕΙΣ ΦΩΤΟΓΡΑΦΙΩΝ: να φαίνεται το ΠΡΟΪΟΝ, όχι ο τόπος =====================
   'File:…' = απευθείας φωτογραφία του ίδιου του προϊόντος στη Wikimedia Commons.
   Όπου δεν υπάρχει ελεύθερη φωτογραφία του συγκεκριμένου τοπικού προϊόντος → φωτογραφία του ίδιου ΤΥΠΟΥ προϊόντος. */
(function(){
const FIX={
 /* τυριά */
 gravieranaxou:'File:Naxos Graviéra.jpg', arseniko:'File:Arseniko Naxou Babounis.jpg', thilyko:'File:Αρσενικό Νάξου 6871.jpg',
 sanmichali:'File:Σαν Μιχάλη 2370.jpg', ladotyrityri:'File:Ladotyri Mytilinis AB.jpg', ladotyri:'File:Ladotyri Mytilinis AB.jpg', ladotyrizakynthou:'File:Ladotyri Mytilinis AB.jpg',
 talaganityri:'File:Ταλαγάνι σε γκριλ 2024.jpg', masteloxiou:'File:Ταλαγάνι σε γκριλ 2024.jpg', formaella:'File:Ταλαγάνι σε γκριλ 2024.jpg',
 krasotyri:'File:Krasotyri Kos Airport.jpg', kalathakilimnou:'File:Kalathaki Limnou Dabizas.jpg', anevato:'File:Anevato cheese.jpg',
 thermiotiko:'File:Tyri Kythnos 1.jpg', kefalotyrikeas:'File:Tyri Kythnos 2.jpg', skotyri:'File:Σκοτύρι 6588.jpg', melichloro:'File:Melichloro.jpg',
 havarti:'File:Cream havarti on bread.jpg', quesofresco:'File:Queso Fresco Mexicano.jpg', manourasifnou:'File:Xidis Sifniot Cheese Counter.jpg',
 vouvalisio:'File:Water buffalo yoghurt.jpg', kapnistosulguni:'File:Μετσοβόνε 6304.jpg', stakavoutyro:'File:Στάκα 5574.jpg', sitaka:'File:Στάκα 5574.jpg',
 katikidomokou:'File:Κατίκι Δομοκού 1130.jpg', galotyri:'File:Κατίκι Δομοκού 1130.jpg', tsalafouti:'File:Κατίκι Δομοκού 1130.jpg', xygalo:'File:Κατίκι Δομοκού 1130.jpg',
 xloro:'Mizithra', graviera_ithaka:'Mizithra', volaki:'Graviera', petroto:'Kefalotyri', malaka:'Kasseri', gidiniskyrou:'Goat cheese', kathoura:'Goat cheese',
 metsovella:'Montasio', vlachiko:'Kefalotyri', manouramilou:'Kefalotyri', tyrozouli:'Kefalotyri', touloumotyri:'Feta',
 /* αλλαντικά */
 synglinop:'File:Σύγλινο 2015.jpg', syglino:'File:Σύγλινο 2015.jpg', apakip:'File:Απάκι από χοιρινό 0675.jpg', apaki:'File:Απάκι από χοιρινό 0675.jpg',
 noumboulo:'File:Νούμπουλο.jpg', loutza:'File:Luntza und Hieromeri.jpg', xoiromeri:'File:Luntza und Hieromeri.jpg',
 /* κρασιά (ποικιλίες χωρίς δική τους φωτογραφία → ποτήρι του ίδιου χρώματος) */
 robola:'File:Robola Grape.jpg', aidani:'el:Αηδάνι',
 limnio:'Red wine', mavrotragano:'Red wine', mandilaria:'Red wine', negoska:'Red wine', avgoustiatis:'Red wine', skiadopoulo:'Red wine',
 thrapsathiri:'White wine', tsaousi:'White wine', plyto:'White wine', romeiko:'White wine', goustolidi:'White wine', kydonitsa:'White wine', franciacorta:'Sparkling wine',
 /* πιάτα & γλυκά */
 pitaroudia:'File:Pitaroudia.jpg', ladenia:'File:Ladenia Kimolou.jpg', kremmydopita:'File:Caramelized onion pie.jpg',
 pagotomastixa:'File:Lor Tatlısı and Mastic Ice Cream.jpg', pagotokafefreddo:'File:Lor Tatlısı and Mastic Ice Cream.jpg', mastixacappuccino:'Cappuccino', ypovrixio:'Spoon sweets',
 santorinisalata:'Greek salad', skopelitiki:'Tiropita', pitarakia:'Tiropita', kixi:'Tiropita', pispilita:'Spanakopita', psaropita:'Börek',
 pastitsada:'Ragù', bianco:'Fish soup', psarixorta:'Fish soup', lalagia:'Diples', antikristo:'Asado', tsigariasto:'Goat meat',
 glykontomataki:'Spoon sweets', xalvadopita:'Nougat', poutigkakerkyra:'Bread pudding', myzithropita:'Pancake'
};
DB.forEach(x=>{if(FIX[x.id])x.wp=FIX[x.id];});
})();
