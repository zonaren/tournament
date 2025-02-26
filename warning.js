// Description: This script is used to show a warning message when the user tries to leave the page.
// This scipt is temporary and will be removed in the future.

window.addEventListener('beforeunload', function (e) {
var confirmationMessage = 'Are you sure you want to leave this page?';
    
e.returnValue = confirmationMessage; 
// Standard way to show the confirmation dialog
return confirmationMessage; // For some  older browsers
// });