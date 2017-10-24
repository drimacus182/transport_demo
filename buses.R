library(dplyr)
library(lubridate)
library(ggplot2)
library(tidyr)

buses <- read.csv("data/buses_day.csv", colClasses=c('integer', 'character', 'numeric', 'numeric', 'integer', 'character', 'integer', 'numeric'))
trolls <- read.csv("data/troll_day.csv", colClasses=c('integer', 'character', 'numeric', 'numeric', 'integer', 'character', 'integer', 'numeric'))
trams <- read.csv("data/tram_day.csv", colClasses=c('integer', 'character', 'numeric', 'numeric', 'integer', 'character', 'integer', 'numeric'))
mts <- read.csv("data/mt_day.csv", colClasses=c('integer', 'character', 'numeric', 'numeric', 'integer', 'character', 'integer'))

transform_dataset <- function(df) {
  groupping_time = 20
  
  day1="2016-08-01"
  day2="2016-08-02"
  
  df <- df %>%   
    filter(GPS_DATETIME >= day1 & GPS_DATETIME < day2) %>% 
    mutate(GPS_DATETIME=GPS_DATETIME %>% as.POSIXct) %>%
    mutate(time=floor(as.integer(GPS_DATETIME) / groupping_time) * groupping_time) %>% 
    select(unit=UNIT_NO, lon=LONGITUDE, lat=LATITUDE, time)
    
  grouped <- df %>% 
    mutate(time=as.integer(time)) %>% 
    group_by(unit, time) %>%
    filter(row_number()==1) %>% 
    ungroup()
  
  units <- grouped %>% select(unit) %>% distinct() %>% mutate(unit_id = row_number())
  minutes <- seq(as.POSIXct(day1) %>% as.integer, as.POSIXct(day2) %>% as.integer - groupping_time, groupping_time)
  
  fill <- function(vec, si, ei) {
    if (si < 1) return(vec)
    if (ei - si < 2) return(vec) 
    
    sv = vec[si]
    ev = vec[ei]
    dv = (ev - sv) / (ei - si)
    
    for (i in 1:(ei - si - 1)) {
      vec[si + i] = sv + dv * i
    }
    
    vec
  }
  
  fill_gaps <- function(vec, max_gap) {
    s = 0
    e = 0
    
    prev.na = T
    
    for (i in 1:length(vec)) {
      na = is.na(vec[i])
      if (na & !prev.na) { s = i-1 }
      if (!na & prev.na) { 
        e = i 
        
        len = e-s-1
        if (len <= max_gap) {
          vec = fill(vec, s, e)  
        }
      }
      prev.na = na
    }
    
    vec
  }
  
  full <- data.frame(time=minutes) %>% 
    merge(units, by=NULL) %>% 
    left_join(grouped, by=c("unit", "time")) %>% 
    select(-unit) %>% rename(unit = unit_id) %>%  
    arrange(time, unit) %>% 
    group_by(unit) %>% 
    arrange(time) %>% 
    mutate(lat = fill_gaps(lat, 6), lon = fill_gaps(lon, 6)) %>% 
    mutate(time = (time - as.integer(as.POSIXct(day1))) / groupping_time) %>% 
    mutate(lat=lat %>% round(digits=4), lon=lon %>% round(digits=4))
  
  full
}

buses_out <- transform_dataset(buses)
trolls_out <- transform_dataset(trolls)
trams_out <- transform_dataset(trams)
mts_out <- transform_dataset(mts)

write.csv(buses_out, "first/data/buses.csv", row.names = F, na="")
write.csv(trolls_out, "first/data/trolls.csv", row.names = F, na="")
write.csv(trams_out, "first/data/trams.csv", row.names = F, na="")
write.csv(mts_out, "first/data/mts.csv", row.names = F, na="")


# full %>% 
#   nest() %>%
#   mutate(row=row_number()) %>% 
#   mutate(purrr::map2(data, row, function(df, r){
#     write.csv(df, paste0("canvas/data/frames/", r, ".csv"), row.names = F, na = "")
#   }))
  








