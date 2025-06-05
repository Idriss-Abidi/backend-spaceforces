package com.ensias.spaceforces.stat;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor

public class StatDTO {
    Long quizes;
    Long users;
    Long submissions;
    Long upcomingquizes;
}
