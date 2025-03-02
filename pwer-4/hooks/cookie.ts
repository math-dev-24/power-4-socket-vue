export const useCookie = () => {

    function getCookie(key: string) {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, cookie.indexOf('=')) === key) {
                return cookie.substring(cookie.indexOf('=') + 1);
            }
        }
        return '';
    }

    function setCookie(key: string, value: string) {
        document.cookie = key + '=' + value + ';path=/';
    }

    return {
        getCookie,
        setCookie
    }
}