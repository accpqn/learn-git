#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
文本文件单词频率统计程序
读取文本文件，统计每个单词的出现频率
"""

import re
import os
from collections import Counter

def read_text_file(filename):
    """
    读取文本文件内容
    
    Args:
        filename (str): 文件名
        
    Returns:
        str: 文件内容
    """
    try:
        with open(filename, 'r', encoding='utf-8') as file:
            return file.read()
    except FileNotFoundError:
        print(f"错误: 找不到文件 '{filename}'")
        return None
    except UnicodeDecodeError:
        # 如果UTF-8解码失败，尝试其他编码
        try:
            with open(filename, 'r', encoding='gbk') as file:
                return file.read()
        except UnicodeDecodeError:
            print(f"错误: 无法读取文件 '{filename}'，编码格式不支持")
            return None
    except Exception as e:
        print(f"读取文件时发生错误: {e}")
        return None

def extract_words(text):
    """
    从文本中提取单词
    
    Args:
        text (str): 文本内容
        
    Returns:
        list: 单词列表
    """
    # 使用正则表达式提取单词（包含中文字符）
    # 匹配字母、数字、中文字符
    words = re.findall(r'[a-zA-Z0-9\u4e00-\u9fff]+', text.lower())
    return words

def count_word_frequency(words):
    """
    统计单词频率
    
    Args:
        words (list): 单词列表
        
    Returns:
        Counter: 单词频率统计结果
    """
    return Counter(words)

def display_frequency(word_freq, top_n=10):
    """
    显示单词频率统计结果
    
    Args:
        word_freq (Counter): 单词频率统计结果
        top_n (int): 显示前N个最频繁的单词
    """
    print(f"\n=== 单词频率统计结果 ===")
    print(f"总共找到 {len(word_freq)} 个不同的单词")
    print(f"总单词数: {sum(word_freq.values())}")
    
    print(f"\n前 {top_n} 个最频繁的单词:")
    print("-" * 30)
    print(f"{'单词':<15} {'频率':<10}")
    print("-" * 30)
    
    for word, count in word_freq.most_common(top_n):
        print(f"{word:<15} {count:<10}")

def save_results(word_freq, output_filename):
    """
    将结果保存到文件
    
    Args:
        word_freq (Counter): 单词频率统计结果
        output_filename (str): 输出文件名
    """
    try:
        with open(output_filename, 'w', encoding='utf-8') as file:
            file.write("单词频率统计结果\n")
            file.write("=" * 30 + "\n")
            file.write(f"总共找到 {len(word_freq)} 个不同的单词\n")
            file.write(f"总单词数: {sum(word_freq.values())}\n\n")
            
            file.write("单词\t\t频率\n")
            file.write("-" * 30 + "\n")
            
            for word, count in word_freq.most_common():
                file.write(f"{word}\t\t{count}\n")
                
        print(f"\n结果已保存到文件: {output_filename}")
    except Exception as e:
        print(f"保存文件时发生错误: {e}")

def main():
    """主函数"""
    print("=== 文本文件单词频率统计器 ===")
    
    # 获取文件名
    filename = input("请输入要分析的文本文件名: ").strip()
    
    if not filename:
        print("错误: 文件名不能为空")
        return
    
    # 检查文件是否存在
    if not os.path.exists(filename):
        print(f"错误: 文件 '{filename}' 不存在")
        return
    
    # 读取文件
    text = read_text_file(filename)
    if text is None:
        return
    
    # 提取单词
    words = extract_words(text)
    if not words:
        print("文件中没有找到任何单词")
        return
    
    # 统计频率
    word_freq = count_word_frequency(words)
    
    # 显示结果
    try:
        top_n = int(input("请输入要显示的前N个最频繁单词数量 (默认10): ") or "10")
    except ValueError:
        top_n = 10
    
    display_frequency(word_freq, top_n)
    
    # 询问是否保存结果
    save_choice = input("\n是否将完整结果保存到文件? (y/n): ").strip().lower()
    if save_choice in ['y', 'yes', '是']:
        output_filename = input("请输入输出文件名 (默认: word_frequency_result.txt): ").strip()
        if not output_filename:
            output_filename = "word_frequency_result.txt"
        save_results(word_freq, output_filename)

if __name__ == "__main__":
    main()
