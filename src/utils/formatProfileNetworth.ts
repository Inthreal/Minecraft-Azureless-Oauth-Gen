import { ErrorResponse, FormattedNetworth, NetworthData } from "../types";

function formatProfileNetworth(profileNetworth: NetworthData | ErrorResponse): FormattedNetworth {
    if (!('error' in profileNetworth)) {                
        var formattedSoulboundNetworth = Intl.NumberFormat('en-US', {
            notation: 'compact',
            maximumFractionDigits: 2,
        }).format(profileNetworth.networth);

        var formattedUnsoulboundNetworth = Intl.NumberFormat('en-US', {
            notation: 'compact',
            maximumFractionDigits: 2,
        }).format(profileNetworth.unsoulboundNetworth);
    } else {
        var formattedSoulboundNetworth = "0";
        var formattedUnsoulboundNetworth = "0";
    }

    return {
        formattedSoulboundNetworth,
        formattedUnsoulboundNetworth,
    } as FormattedNetworth;
}

export default formatProfileNetworth;