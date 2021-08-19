let config = null;
let value = null;

function refreshTypes() {
    if (!value || value.length == 0) {
        $("#registered_types").html("No registered types");
        return;
    }

    $("#registered_types").html("");

    for (let val of value) {
        let d = document.createElement('div');
        $(d).addClass("chip").html(val).appendTo($("#registered_types"));
    }
}

function register() {
    const contentType = $("#autocomplete-input").val();
    if (!contentType) {
        M.toast({ html: 'No content type selected!' })
        $('#modal1').modal('close');
    }
    else {
        $.LoadingOverlay("show");
        axios({
            method: 'post',
            url: "/.netlify/functions/recombee-init-function",
            data: {
                "projectId": config.projectId,
                "language": config.language.codename,
                "contentType": contentType,
                "recombeeDb": config.recombeeAppId
            }
        })
            .catch((error) => {
                $.LoadingOverlay("hide");
                $('#modal1').modal('close');
                M.toast({ html: "Something went wrong, consult console for error details!" });
            })
            .then((response) => {
                console.log("value: " + value);
                if (!value.includes(contentType)) {
                    value.push(contentType);
                }
                $('#autocomplete-input').val("");
                refreshTypes();
                CustomElement.setValue(JSON.stringify(value));
                $.LoadingOverlay("hide");
                $('#modal1').modal('close');
                M.toast({ html: "Recombee updated with the selected type: " + contentType });
            });
    }

}

$(document).ready(function () {
    CustomElement.setHeight(300);
    $("#modal1").modal();

    CustomElement.init((element, _context) => {

        value = JSON.parse(element.value) || [];
        config = element.config || {};
        config.projectId = _context.projectId;
        config.language = _context.variant;

        refreshTypes();

        const Kc = window['kontentDelivery'];
        var deliveryClient = new Kc.DeliveryClient({
            projectId: config.projectId
        });

        deliveryClient.types().toPromise().then((response) => {
            let types = {};
            response.types.map(t => t.system).forEach((element, index) => {
                types[element.codename] = null;
            });
            $('#autocomplete-input').autocomplete({ data: types });
        })
    });
});

