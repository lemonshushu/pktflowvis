import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Slider } from '@mui/material';
import { setFilteredPackets, setFilterEpoch } from './timeSliderSlice';

export default function TimeSlider() {
    const packets = useSelector((state) => state.data.packets);
    const startEpoch = useSelector((state) => state.data.startEpoch);      // µs 단위
    const endEpoch = useSelector((state) => state.data.endEpoch);          // µs 단위
    const filterStartEpoch = useSelector((state) => state.timeSlider.filterStartEpoch);  // µs 단위
    const filterEndEpoch = useSelector((state) => state.timeSlider.filterEndEpoch);      // µs 단위

    const dispatch = useDispatch();

    // [1] 에디팅 전용 로컬 상태: 입력 도중에는 문자 그대로 유지
    const [startSecondsInput, setStartSecondsInput] = useState("");
    const [endSecondsInput, setEndSecondsInput] = useState("");

    // [2] Redux state -> 로컬 상태 동기화
    // 슬라이더 움직이거나 외부에서 Redux 상태가 갱신되면 이 로컬 상태도 매번 맞춰준다.
    useEffect(() => {
        // µs -> 초로 변환 + 문자열로
        setStartSecondsInput(µsToSeconds(filterStartEpoch).toString());
        setEndSecondsInput(µsToSeconds(filterEndEpoch).toString());
    }, [filterStartEpoch, filterEndEpoch]);

    const µsToSeconds = (µsValue) => {
        // 편의상 반올림 or 내림처리 가능
        return (µsValue / 1_000_000).toFixed(6); 
    };

    const secondsToµs = (secValue) => {
        return Math.round(Number(secValue) * 1_000_000);
    };

    /** 패킷 필터링 로직 */
    const filterPackets = (startµs, endµs) => {
        const filtered = packets.filter((packet) => {
            const epoch = packet._source.layers.frame["frame.time_epoch"] * 1_000_000;
            return (startEpoch + startµs <= epoch && epoch <= startEpoch + endµs);
        });
        dispatch(setFilteredPackets(filtered));
    };

    /** 슬라이더를 움직였을 때 */
    const handleSliderChange = (event, newValue) => {
        // newValue = [startµs, endµs]
        dispatch(setFilterEpoch(newValue));
        filterPackets(newValue[0], newValue[1]);
    };

    /** 
     * [3] Start/End 입력 필드 onChange
     * - 입력 중에는 로컬 상태만 업데이트 -> 문자열 그대로 유지
     */
    const handleStartInputChange = (e) => {
        setStartSecondsInput(e.target.value);
    };
    const handleEndInputChange = (e) => {
        setEndSecondsInput(e.target.value);
    };

    /**
     * [3] Start/End 입력 필드 onBlur
     * - 포커스를 잃었을 때(혹은 Enter) 최종적으로 Redux에 반영
     */
    const handleStartInputBlur = () => {
        const newStartSeconds = parseFloat(startSecondsInput);
        if (isNaN(newStartSeconds) || newStartSeconds < 0) {
            // 유효하지 않은 입력 -> 0초로 리셋
            dispatch(setFilterEpoch([0, filterEndEpoch]));
            filterPackets(0, filterEndEpoch);
        } else {
            const newStartµs = secondsToµs(newStartSeconds);
            const validStartµs = Math.min(newStartµs, filterEndEpoch); // start <= end
            dispatch(setFilterEpoch([validStartµs, filterEndEpoch]));
            filterPackets(validStartµs, filterEndEpoch);
        }
    };

    const handleEndInputBlur = () => {
        const newEndSeconds = parseFloat(endSecondsInput);
        const maxRangeSeconds = (endEpoch - startEpoch) / 1_000_000;
        if (isNaN(newEndSeconds) || newEndSeconds < 0) {
            // 유효하지 않은 입력 -> 0초로 리셋 (start와 동일)
            dispatch(setFilterEpoch([filterStartEpoch, filterStartEpoch]));
            filterPackets(filterStartEpoch, filterStartEpoch);
        } else {
            const newEndµs = secondsToµs(newEndSeconds);
            let validEndµs = Math.max(filterStartEpoch, newEndµs); // end >= start
            validEndµs = Math.min(validEndµs, endEpoch - startEpoch); // 최대 범위 제한
            dispatch(setFilterEpoch([filterStartEpoch, validEndµs]));
            filterPackets(filterStartEpoch, validEndµs);
        }
    };

    return (
        <div style={{ width: '90%', margin: '0 auto' }}>
            {/* 슬라이더 (마이크로초 단위) */}
            <Slider
                style={{ width: '100%' }}
                value={[filterStartEpoch, filterEndEpoch]}
                onChange={handleSliderChange}
                valueLabelDisplay="auto"
                min={0}
                max={endEpoch - startEpoch}
                valueLabelFormat={(value) => `${(value/1_000_000).toFixed(3)}s`}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                    <label>Start (sec): </label>
                    <input
                        type="text"  // number 대신 text로 -> 사용자 입력 그대로 유지 가능
                        value={startSecondsInput}
                        onChange={handleStartInputChange}
                        onBlur={handleStartInputBlur}
                        style={{ width: '100%', marginRight:"5%" }}
                    />
                </div>
                <div>
                    <label>End (sec): </label>
                    <input
                        type="text"
                        value={endSecondsInput}
                        onChange={handleEndInputChange}
                        onBlur={handleEndInputBlur}
                        style={{ width: '100%', marginLeft:"5%" }}
                    />
                </div>
            </div>

            
        </div>
    );
}
