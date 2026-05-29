function redrawBasic() {
    switch (getProgramName.name()) {
        case 'I0401LB':
            redrawBasic_I0401LB()
            break;
        case 'I0644LB':
            redrawBasic_I0644LB()
            break;
        //case 'ICGE011':
        //    redrawBasic_ICGE011()
        //    break;
        default:
            break;
    }
}