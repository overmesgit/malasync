def format_dates(title_dict):
    time_fields = {'aired_from', 'aired_to', 'last_update'}
    for f in time_fields:
        if title_dict[f]:
            title_dict[f] = title_dict[f].strftime('%Y-%m-%d %H:%M:%S')
    return title_dict