
export function stripHTMLTags(text: string): string {
    return text.replace(/(<([^>]+)>)/gi, "");
}


/*
 ajax example
 $.ajax({
        url: "http://localhost/myproject/ajax_url",
        type: "POST",
        data: $("#my-form").serialize(),
        dataType: 'json', // lowercase is always preferered though jQuery does it, too.
        success: function(){}
});
 
 
 */

export function avatarName(name: string) {
    const unknown = "?";
    if (!name || name.length <= 0)
        return unknown;

    const nameParts = name.split(" ");
    let res:string = "";
    nameParts.forEach(p => {
        if (p.length > 0) res += p[0];
    });
    if (res.length <= 0) unknown;

    return res.toUpperCase().substr(0, 2);
}

export const random = (min: number, max: number) => Math.floor(Math.random() * (max - min)) + min;