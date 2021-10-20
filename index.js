const  moment =  require('moment');

// helpers -------------------------------------------------------------------------------------------------------------

const onlyNumeric = (value) => {
    return value ? String(value).replace(/\D/g, '') : '';
};

const toMask = (value , mask) => {
    if (!value) return '';
    const unmask = onlyNumeric(value);
    let digit = 0;
    let output = '';
    if (!unmask.length) return '';
    for (let i = 0; i < mask.length; i++)
        if (mask.charAt(i) === '_') {
            output = output + unmask.charAt(digit);
            if (!unmask.charAt(digit + 1)) break;
            digit = digit + 1;
        } else output = output + mask.charAt(i);
    return output;
};

const toMaskDate = (value, mask) => {
    if (!value) return '';
    return moment(
        value,
        value.charAt(2) === '/' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'
    ).format(mask);
};

// format --------------------------------------------------------------------------------------------------------------

const format_accents = (value) => {
    if (!value) return '';
    const a = 'ÀÁÂÃÄÅàáâãäåÒÓÔÕÕÖØòóôõöøÈÉÊËèéêëÇçÐðÌÍÎÏìíîïÙÚÛÜùúûüÑñŠšŸÝÿýŽž';
    const s = 'AAAAAAaaaaaaOOOOOOOooooooEEEEeeeeCcDdIIIIiiiiUUUUuuuuNnSsYYyyZz';
    const replace = [];
    for (let i = 0; i < a.length; i++) replace[a[i]] = s[i];
    return value.replace(/[^A-Za-z0-9]/g, (x) => replace[x] || x);
};

const format_capitalize = (value) => {
    if (!value) return '';
    return value.length > 1
        ? value[0].toUpperCase() + value.substr(1).toLowerCase()
        : value[0].toUpperCase();
};

const format_datetime = (value) => {
    if (!value) return '';
    const date = moment(value).format('DD/MM/YYYY');
    const hour = moment(value).format('HH:mm');
    return `${date} às ${hour}`;
};

const format_name = (value) => {
    if (!value) return '';
    const exclude = 'a,as,à,às,com,da,de,do,e,etc,na,no,o'.split(',');
    return value
        .split(' ')
        .map((word) => {
            const lower = word.toLowerCase();
            if (!exclude.includes(lower))
                return lower[0]
                    ? lower[0].toUpperCase() + lower.substr(1).toLowerCase()
                    : '';
            return lower;
        })
        .join(' ');
};

const format_search = (value) => {
    if (!value) return '';
    return format_accents(
        value
            .toLowerCase()
            .replaceAll('.', '')
            .replaceAll('-', '')
            .replaceAll('/', '')
    );
};

// mask ----------------------------------------------------------------------------------------------------------------

const mask_currency = (value) => {
    if (!value) return '';
    value = String(
        Number(String(value).replaceAll('.', '').replaceAll(',', ''))
    );
    let decimal = value.substr(value.length - 2, value.length);
    let integer = value.substr(0, value.length - 2);
    if (decimal === '0') return '';
    if (decimal.length === 1) decimal = '0' + decimal;
    if (integer.length)
        integer = String(integer).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
    else integer = '0';
    return integer + ',' + decimal;
};

const mask_date = (value) => {
    if (!value) return '';
    if (value.length === 10 || value.indexOf('T') !== -1)
        value = toMaskDate(value, 'DD/MM/YYYY');
    return toMask(value, '__/__/____');
};

const mask_phone = (value) => {
    if (!value) return '';
    const unmaskPhone = String(onlyNumeric(value.replace('+55', '')));
    return toMask(
        unmaskPhone,
        unmaskPhone.substr(0, 1) === '0'
            ? '____-___-____'
            : unmaskPhone.length === 11
            ? '(__) _____-____'
            : '(__) ____-____'
    );
};

// unmask --------------------------------------------------------------------------------------------------------------

const unmask_currency = (value) => {
    if (!value) return;
    value = String(
        Number(String(value).replaceAll('.', '').replaceAll(',', ''))
    );
    const decimal = value.substr(value.length - 2, value.length);
    const integer = value.substr(0, value.length - 2);
    return Number(integer + '.' + decimal);
};

const unmask_phone = (value)  => {
    if (!value) return '';
    const unmakedValue = onlyNumeric(value);
    if (!unmakedValue) return;
    if (unmakedValue.substr(0, 2) === '55') return `+${unmakedValue}`;
    return `+55${unmakedValue}`;
};

// export --------------------------------------------------------------------------------------------------------------

 const mask = {
    // format
    accent: format_accents,
    capitalize: format_capitalize,
    datetime: format_datetime,
    name: format_name,
    search: format_search,
    // mask
    cnpj: (value) => toMask(value, '__.___.___/____-__'),
    cpf: (value) => toMask(value, '___.___.___-__'),
    currency: mask_currency,
    date: mask_date,
    phone: mask_phone,
    time: (value) => toMask(value, '__:__'),
    zipcode: (value) => toMask(value, '_____-___'),
};

 const unmask = {
    cnpj: (value) => onlyNumeric(value),
    cpf: (value) => onlyNumeric(value),
    currency: unmask_currency,
    date: (value) => toMaskDate(value, 'YYYY-MM-DD'),
    phone: unmask_phone,
    time: (value) => toMask(value, '__:__'),
    zipcode: (value) => onlyNumeric(value),
};

module.exports = {
    mask, unmask
}